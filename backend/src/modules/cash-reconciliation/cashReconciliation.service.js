import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Midnight-to-midnight bounds for one calendar day in the server's local
// time zone. Same helper as shiftClosing.service.js's dayBounds —
// duplicated rather than cross-imported since neither module exports it.
function dayBounds(dateStr) {
  const start = dateStr ? new Date(`${dateStr}T00:00:00`) : new Date();
  if (Number.isNaN(start.getTime())) throw new ApiError(400, 'Invalid date');
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function formatDayLabel(date) {
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function refDateKey(date) {
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// Cosmetic-only display reference — "CR-YYMMDD-<shiftNo>" — derived from
// the real ShiftSession row's own closedAt/shiftNo, never stored. Same
// reasoning as shiftClosing.service.js's displayReferenceNo, kept under
// its own "CR" prefix so a reconciliation row and its underlying Shift
// Closing row are never confused for the same reference even though both
// come from the same ShiftSession.
function displayReferenceNo(row) {
  return `CR-${refDateKey(row.closedAt)}-${row.shiftNo}`;
}

function timeOfDayLabel(hour) {
  if (hour < 12) return 'Morning';
  if (hour < 16) return 'Afternoon';
  if (hour < 20) return 'Evening';
  return 'Night';
}

// Labels each day's CLOSED shifts in chronological order — "Shift 1 -
// Morning", "Shift 2 - Afternoon", etc — identical to shiftClosing.
// service.js's withShiftLabel, duplicated rather than cross-imported so
// this read-only module has no dependency on the shift-closing module.
function withShiftLabel(rowsAsc) {
  return rowsAsc.map((row, index) => ({
    ...row,
    shiftLabel: `Shift ${index + 1} - ${timeOfDayLabel(row.closedAt.getHours())}`,
  }));
}

function reconciliationStatus(variance) {
  if (variance > 0) return 'Over';
  if (variance < 0) return 'Short';
  return 'Exact Match';
}

const TYPE_DEFS = [
  { id: 'short', label: 'Cash Short', color: '#E5484D', test: (v) => v < 0 },
  { id: 'over', label: 'Cash Over', color: '#C1560A', test: (v) => v > 0 },
  { id: 'exact', label: 'Exact Match', color: '#22A06B', test: (v) => v === 0 },
];

/**
 * Powers the Cashier Panel's Cash Reconciliation report. There is no
 * separate create-flow or table here at all — a "cash reconciliation" IS
 * the reconciliation view of a CLOSED ShiftSession row: System Cash is
 * that shift's real expectedClosingCash, Counted Cash is its real
 * closingCash, and Variance is its real closingVariance — all three
 * computed once, from real Sale/CashWithdrawal/CashDeposit/CashTransfer
 * rows, at the moment closeShift() (shiftSession.service.js) closed it.
 * This module only re-reads and reshapes that same real data; it never
 * recomputes or re-derives a variance of its own.
 *
 * - stats.totalReconciliations / avgVariance are all-time totals for the
 *   cashier's outlet's CLOSED shifts (sum/average of real closingCash /
 *   closingVariance).
 * - stats.totalReconciled is the all-time count of CLOSED shifts (every
 *   closed shift has, by definition, been reconciled).
 * - stats.todaysReconciliation is always the server's current calendar
 *   day, independent of the `date` filter.
 * - stats.selectedDateReconciliation / summary / byType / transactions
 *   are all scoped to `date` (defaults to today), keyed off closedAt.
 * - byType/donut buckets the selected date's shifts into Cash Short /
 *   Cash Over / Exact Match by the sign of their real variance; a bucket
 *   with no shifts that day honestly shows 0 rather than being omitted.
 */
export async function getCashReconciliationReport(tenantId, outletId, params = {}) {
  const outletFilter = outletId ? { outletId } : {};
  const { start: dayStart, end: dayEnd } = dayBounds(params.date);
  const { start: todayStart, end: todayEnd } = dayBounds();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  const [allTimeAgg, todaysAgg, dayShiftsAsc] = await Promise.all([
    prisma.shiftSession.aggregate({
      where: { tenantId, ...outletFilter, status: 'CLOSED' },
      _sum: { closingCash: true },
      _avg: { closingVariance: true },
      _count: { _all: true },
    }),
    prisma.shiftSession.aggregate({
      where: { tenantId, ...outletFilter, status: 'CLOSED', closedAt: { gte: todayStart, lte: todayEnd } },
      _sum: { closingCash: true },
      _count: { _all: true },
    }),
    prisma.shiftSession.findMany({
      where: { tenantId, ...outletFilter, status: 'CLOSED', closedAt: { gte: dayStart, lte: dayEnd } },
      orderBy: { closedAt: 'asc' },
    }),
  ]);

  const totalValue = round2(allTimeAgg._sum.closingCash || 0);
  const totalCount = allTimeAgg._count._all;
  const avgVariance = round2(allTimeAgg._avg.closingVariance || 0);

  const dayRowsWithLabel = withShiftLabel(dayShiftsAsc);
  const totalCountedCashOnDate = round2(dayShiftsAsc.reduce((sum, row) => sum + Number(row.closingCash || 0), 0));
  const totalSystemCashOnDate = round2(dayShiftsAsc.reduce((sum, row) => sum + Number(row.expectedClosingCash || 0), 0));
  const totalVarianceOnDate = round2(dayShiftsAsc.reduce((sum, row) => sum + Number(row.closingVariance || 0), 0));
  const variancePercentOnDate = totalSystemCashOnDate ? round2((totalVarianceOnDate / totalSystemCashOnDate) * 100) : 0;
  const distinctCashiers = [...new Set(dayShiftsAsc.map((row) => row.cashierName))];

  const byType = TYPE_DEFS.map((def) => {
    const matches = dayShiftsAsc.filter((row) => def.test(Number(row.closingVariance || 0)));
    return {
      id: def.id,
      label: def.label,
      color: def.color,
      count: matches.length,
      value: round2(matches.reduce((sum, row) => sum + Number(row.closingVariance || 0), 0)),
    };
  });

  // Most-recent-first for the table, same convention as every other
  // cash-movement report — ascending order above was only needed to
  // number "Shift 1/2/3..." correctly.
  const dayRowsDesc = [...dayRowsWithLabel].reverse();
  const totalPages = Math.max(Math.ceil(dayRowsDesc.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = dayRowsDesc.slice(pageStart, pageStart + pageSize);

  return {
    stats: {
      totalReconciliations: { value: totalValue, transactions: totalCount },
      totalReconciled: { value: totalCount },
      avgVariance: { value: avgVariance },
      todaysReconciliation: { value: round2(todaysAgg._sum.closingCash || 0), transactions: todaysAgg._count._all },
      selectedDateReconciliation: { value: totalCountedCashOnDate, date: formatDayLabel(dayStart) },
    },
    summary: {
      totalReconciliation: totalCountedCashOnDate,
      totalTransactions: dayShiftsAsc.length,
      reconciledBy: distinctCashiers.length ? distinctCashiers.join(', ') : '—',
      totalSystemCash: totalSystemCashOnDate,
      totalCountedCash: totalCountedCashOnDate,
      totalVariance: totalVarianceOnDate,
      variancePercent: variancePercentOnDate,
    },
    byType,
    transactions: pageRows.map((row) => {
      const variance = round2(Number(row.closingVariance || 0));
      const systemCash = round2(Number(row.expectedClosingCash || 0));
      return {
        dateTime: row.closedAt,
        referenceNo: displayReferenceNo(row),
        reconciliationType: row.shiftLabel,
        reconciledBy: row.cashierName,
        systemCash,
        countedCash: round2(Number(row.closingCash || 0)),
        variance,
        variancePercent: systemCash ? round2((variance / systemCash) * 100) : 0,
        status: reconciliationStatus(variance),
        remarks: row.closingRemarks || null,
      };
    }),
    totalPages,
    page: safePage,
    pageSize,
  };
}
