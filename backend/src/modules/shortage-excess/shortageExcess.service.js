import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Midnight-to-midnight bounds for one calendar day in the server's local
// time zone. Same helper as cashReconciliation.service.js's dayBounds —
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

// Cosmetic-only display reference — "SE-YYMMDD-<shiftNo>" — derived from
// the real ShiftSession row's own closedAt/shiftNo, never stored. Same
// reasoning as cashReconciliation.service.js's displayReferenceNo, kept
// under its own "SE" prefix so this row is never confused with the same
// shift's Shift Closing / Cash Reconciliation reference.
function displayReferenceNo(row) {
  return `SE-${refDateKey(row.closedAt)}-${row.shiftNo}`;
}

function timeOfDayLabel(hour) {
  if (hour < 12) return 'Morning';
  if (hour < 16) return 'Afternoon';
  if (hour < 20) return 'Evening';
  return 'Night';
}

// Labels each day's CLOSED shifts in chronological order — "Shift 1 -
// Morning", "Shift 2 - Afternoon", etc — over the FULL set of the day's
// closed shifts (not just the ones with a variance), so the "Shift N"
// numbering here always agrees with Shift Closing's and Cash
// Reconciliation's for the same shift. Duplicated from those modules
// rather than cross-imported so this read-only module has no dependency
// on either.
function withShiftLabel(rowsAsc) {
  return rowsAsc.map((row, index) => ({
    ...row,
    shiftLabel: `Shift ${index + 1} - ${timeOfDayLabel(row.closedAt.getHours())}`,
  }));
}

function defaultReason(type) {
  return type === 'Shortage'
    ? 'Cash shortage identified during shift closing'
    : 'Cash excess identified during shift closing';
}

/**
 * Powers the Cashier Panel's Shortage / Excess report. There is no
 * separate create-flow or table here at all — a "shortage / excess"
 * entry is simply the non-zero-variance subset of a CLOSED ShiftSession
 * row's real reconciliation: closingVariance < 0 is a Shortage (counted
 * less than expected), closingVariance > 0 is an Excess (counted more) —
 * both computed once, from real Sale/CashWithdrawal/CashDeposit/
 * CashTransfer rows, at the moment closeShift() (shiftSession.service.js)
 * closed the shift. This module only re-reads, filters, and reshapes
 * that same real data; it never recomputes or re-derives a variance of
 * its own — see cashReconciliation.service.js's getCashReconciliationReport
 * for the same rows including exact matches.
 *
 * - stats.totalShortageExcess / totalEntries / avgAmount are all-time
 *   totals for the cashier's outlet's CLOSED shifts with a non-zero
 *   variance (sum/count/average of the real |closingVariance|).
 * - stats.todaysShortageExcess is always the server's current calendar
 *   day, independent of the `date` filter.
 * - stats.selectedDateShortageExcess / summary / byType / transactions
 *   are all scoped to `date` (defaults to today), keyed off closedAt.
 * - summary.netAmount is totalShortage − totalExcess: a positive number
 *   means the drawer is net short overall for the day, a negative number
 *   means it's net over.
 * - byType/donut splits the selected date's non-zero-variance shifts into
 *   Shortage / Excess; a type with none that day honestly shows ₹0.00
 *   rather than being omitted.
 */
export async function getShortageExcessReport(tenantId, outletId, params = {}) {
  const outletFilter = outletId ? { outletId } : {};
  const { start: dayStart, end: dayEnd } = dayBounds(params.date);
  const { start: todayStart, end: todayEnd } = dayBounds();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  const [allTimeClosed, todaysClosed, dayShiftsAsc] = await Promise.all([
    prisma.shiftSession.findMany({
      where: { tenantId, ...outletFilter, status: 'CLOSED', closingVariance: { not: 0 } },
      select: { closingVariance: true },
    }),
    prisma.shiftSession.findMany({
      where: {
        tenantId, ...outletFilter, status: 'CLOSED', closingVariance: { not: 0 }, closedAt: { gte: todayStart, lte: todayEnd },
      },
      select: { closingVariance: true },
    }),
    prisma.shiftSession.findMany({
      where: { tenantId, ...outletFilter, status: 'CLOSED', closedAt: { gte: dayStart, lte: dayEnd } },
      orderBy: { closedAt: 'asc' },
    }),
  ]);

  const totalValue = round2(allTimeClosed.reduce((sum, row) => sum + Math.abs(Number(row.closingVariance || 0)), 0));
  const totalCount = allTimeClosed.length;
  const avgAmount = totalCount > 0 ? round2(totalValue / totalCount) : 0;
  const todaysValue = round2(todaysClosed.reduce((sum, row) => sum + Math.abs(Number(row.closingVariance || 0)), 0));

  // Numbered over the full day's closed shifts (see withShiftLabel), then
  // narrowed to only the ones with a real variance — an exact match isn't
  // a shortage or an excess, so it never appears on this report.
  const dayRowsWithLabel = withShiftLabel(dayShiftsAsc)
    .filter((row) => Number(row.closingVariance || 0) !== 0);

  const shortageRows = dayRowsWithLabel.filter((row) => Number(row.closingVariance) < 0);
  const excessRows = dayRowsWithLabel.filter((row) => Number(row.closingVariance) > 0);
  const totalShortage = round2(shortageRows.reduce((sum, row) => sum + Math.abs(Number(row.closingVariance)), 0));
  const totalExcess = round2(excessRows.reduce((sum, row) => sum + Number(row.closingVariance), 0));
  const totalShortageExcessOnDate = round2(totalShortage + totalExcess);
  const netAmount = round2(totalShortage - totalExcess);
  const distinctCashiers = [...new Set(dayRowsWithLabel.map((row) => row.cashierName))];

  const byType = [
    { id: 'shortage', label: 'Shortage', value: totalShortage, color: '#E5484D' },
    { id: 'excess', label: 'Excess', value: totalExcess, color: '#22A06B' },
  ];
  const netAmountLegend = { label: 'Net Amount', value: netAmount, color: '#6B7280' };

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
      totalShortageExcess: { value: totalValue, transactions: totalCount },
      totalEntries: { value: totalCount },
      avgAmount: { value: avgAmount },
      todaysShortageExcess: { value: todaysValue, transactions: todaysClosed.length },
      selectedDateShortageExcess: { value: totalShortageExcessOnDate, date: formatDayLabel(dayStart) },
    },
    summary: {
      totalShortageExcess: totalShortageExcessOnDate,
      totalTransactions: dayRowsWithLabel.length,
      recordedBy: distinctCashiers.length ? distinctCashiers.join(', ') : '—',
      totalShortage,
      totalExcess,
      netAmount,
      shortageCount: shortageRows.length,
      excessCount: excessRows.length,
      status: dayRowsWithLabel.length > 0 ? 'Needs Attention' : 'All Balanced',
    },
    byType,
    netAmountLegend,
    transactions: pageRows.map((row) => {
      const variance = Number(row.closingVariance);
      const type = variance < 0 ? 'Shortage' : 'Excess';
      return {
        dateTime: row.closedAt,
        referenceNo: displayReferenceNo(row),
        type,
        recordedBy: row.cashierName,
        reason: row.closingRemarks || defaultReason(type),
        amount: round2(Math.abs(variance)),
        shift: row.shiftLabel,
        remarks: `Shift ${row.shiftNo} closed by ${row.cashierName}`,
      };
    }),
    totalPages,
    page: safePage,
    pageSize,
  };
}
