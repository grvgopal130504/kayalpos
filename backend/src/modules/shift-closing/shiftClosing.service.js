import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const PAYMENT_METHOD_LABELS = { cash: 'Cash', card: 'Card', upi: 'UPI' };

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Midnight-to-midnight bounds for one calendar day in the server's local
// time zone. Same helper as cashDrawerOpening.service.js's dayBounds —
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

// Cosmetic-only display reference — "SC-YYMMDD-<shiftNo>" — derived from
// the real ShiftSession row's own closedAt/shiftNo, never stored. Same
// reasoning as cashDrawerOpening.service.js's displayReferenceNo: a shift
// closing has no dedicated reference column of its own, it IS the
// ShiftSession row (see shiftSession.service.js's closeShift).
function displayReferenceNo(row) {
  return `SC-${refDateKey(row.closedAt)}-${row.shiftNo}`;
}

function timeOfDayLabel(hour) {
  if (hour < 12) return 'Morning';
  if (hour < 16) return 'Afternoon';
  if (hour < 20) return 'Evening';
  return 'Night';
}

// Labels each day's CLOSED shifts in chronological order — "Shift 1 -
// Morning", "Shift 2 - Afternoon", etc — so the "Closing Summary (By
// Shift)" donut and the transactions table's Shift chip always agree on
// which real shift a label points to. `rowsAsc` must already be sorted
// closedAt ascending.
function withShiftLabel(rowsAsc) {
  return rowsAsc.map((row, index) => ({
    ...row,
    shiftLabel: `Shift ${index + 1} - ${timeOfDayLabel(row.closedAt.getHours())}`,
  }));
}

// "Cash: ₹120.00, Card: ₹80.00" — only the tenders actually used for this
// shift's sales, in a fixed Cash/Card/UPI/Other order. Real per-shift
// figures from a Sale.groupBy over that shift's own [openedAt, closedAt]
// window, not a guess.
function formatPaymentModes(salesByMethod) {
  const byMethod = Object.fromEntries(salesByMethod.map((row) => [row.paymentMethod, Number(row._sum.grandTotal || 0)]));
  const parts = Object.keys(PAYMENT_METHOD_LABELS)
    .filter((method) => byMethod[method])
    .map((method) => `${PAYMENT_METHOD_LABELS[method]}: ₹${round2(byMethod[method]).toFixed(2)}`);
  const otherTotal = salesByMethod
    .filter((row) => !PAYMENT_METHOD_LABELS[row.paymentMethod])
    .reduce((sum, row) => sum + Number(row._sum.grandTotal || 0), 0);
  if (otherTotal) parts.push(`Other: ₹${round2(otherTotal).toFixed(2)}`);
  return parts.length ? parts.join(', ') : '—';
}

/**
 * Powers the Cashier Panel's Shift Closing report. Like Cash Drawer
 * Opening, there is no separate create-flow here — a "shift closing" IS a
 * ShiftSession row once closeShift() (shiftSession.service.js) sets it to
 * CLOSED — so this module only reads that same real data, itemized per
 * CLOSED shift.
 *
 * - stats.totalShiftClosings / totalClosings / avgClosingValue are
 *   all-time totals for the cashier's outlet's CLOSED shifts, keyed off
 *   the closingCash each one recorded at close time.
 * - stats.todaysShiftClosing is always the server's current calendar day,
 *   independent of the `date` filter.
 * - stats.selectedDateClosing / summary / byShift / transactions are all
 *   scoped to `date` (defaults to today), keyed off closedAt.
 * - summary.totalSalesAllModes / cashInDrawerActual / expectedCash /
 *   variance are real sums of the closingTotalSales / closingCash /
 *   expectedClosingCash / closingVariance closeShift() already computed
 *   and stored on each shift at the moment it closed — never
 *   recomputed here, so a day's reconciliation can't drift from what was
 *   actually recorded when each shift closed.
 * - byShift/donut itemizes the selected date's own CLOSED shifts (one
 *   entry per shift, "Shift 1 - Morning" etc — see withShiftLabel); a date
 *   with no closures yet is honestly an empty list, not a padded one.
 */
export async function getShiftClosingReport(tenantId, outletId, params = {}) {
  const outletFilter = outletId ? { outletId } : {};
  const { start: dayStart, end: dayEnd } = dayBounds(params.date);
  const { start: todayStart, end: todayEnd } = dayBounds();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  const [allTimeAgg, todaysAgg, dayShiftsAsc] = await Promise.all([
    prisma.shiftSession.aggregate({
      where: { tenantId, ...outletFilter, status: 'CLOSED' },
      _sum: { closingCash: true },
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
  const avgClosingValue = totalCount > 0 ? totalValue / totalCount : 0;

  const dayRowsWithLabel = withShiftLabel(dayShiftsAsc);
  const totalClosingCashOnDate = round2(dayShiftsAsc.reduce((sum, row) => sum + Number(row.closingCash || 0), 0));
  const totalSalesAllModesOnDate = round2(dayShiftsAsc.reduce((sum, row) => sum + Number(row.closingTotalSales || 0), 0));
  const expectedCashOnDate = round2(dayShiftsAsc.reduce((sum, row) => sum + Number(row.expectedClosingCash || 0), 0));
  const varianceOnDate = round2(dayShiftsAsc.reduce((sum, row) => sum + Number(row.closingVariance || 0), 0));
  const distinctCashiers = [...new Set(dayShiftsAsc.map((row) => row.cashierName))];

  const byShift = dayRowsWithLabel.map((row) => ({
    id: row.id,
    label: row.shiftLabel,
    value: round2(Number(row.closingCash || 0)),
  }));

  // Most-recent-first for the table, same convention as every other
  // cash-movement report — ascending order above was only needed to number
  // "Shift 1/2/3..." correctly.
  const dayRowsDesc = [...dayRowsWithLabel].reverse();
  const totalPages = Math.max(Math.ceil(dayRowsDesc.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = dayRowsDesc.slice(pageStart, pageStart + pageSize);

  // One extra query per page row (bounded by pageSize, at most 100) for its
  // own payment-mode breakdown — run sequentially, one at a time, never
  // folded into a Promise.all, so this request never holds more than one
  // extra connection past the pool's real max: 5 cap (see config/prisma.js)
  // regardless of how many rows are on the page.
  const transactions = [];
  for (const row of pageRows) {
    const salesByMethod = await prisma.sale.groupBy({
      by: ['paymentMethod'],
      where: {
        tenantId, ...outletFilter, createdAt: { gte: row.openedAt, lte: row.closedAt },
      },
      _sum: { grandTotal: true },
    });
    transactions.push({
      dateTime: row.closedAt,
      referenceNo: displayReferenceNo(row),
      shift: row.shiftLabel,
      closedBy: row.cashierName,
      closingCash: round2(Number(row.closingCash || 0)),
      totalSales: round2(Number(row.closingTotalSales || 0)),
      paymentModes: formatPaymentModes(salesByMethod),
      remarks: row.closingRemarks || null,
      status: 'Closed',
    });
  }

  return {
    stats: {
      totalShiftClosings: { value: totalValue, transactions: totalCount },
      totalClosings: { value: totalCount },
      avgClosingValue: { value: round2(avgClosingValue) },
      todaysShiftClosing: { value: round2(todaysAgg._sum.closingCash || 0), transactions: todaysAgg._count._all },
      selectedDateClosing: { value: totalClosingCashOnDate, date: formatDayLabel(dayStart) },
    },
    summary: {
      totalShiftClosing: totalClosingCashOnDate,
      totalTransactions: dayShiftsAsc.length,
      totalClosedBy: distinctCashiers.length ? distinctCashiers.join(', ') : '—',
      totalSalesAllModes: totalSalesAllModesOnDate,
      cashInDrawerActual: totalClosingCashOnDate,
      expectedCash: expectedCashOnDate,
      variance: varianceOnDate,
    },
    byShift,
    transactions,
    totalPages,
    page: safePage,
    pageSize,
  };
}
