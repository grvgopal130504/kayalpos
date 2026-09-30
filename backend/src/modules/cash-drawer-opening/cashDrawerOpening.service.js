import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Midnight-to-midnight bounds for one calendar day in the server's local
// time zone. Same helper as cashWithdrawal.service.js's / cashDeposit.
// service.js's / cashTransfer.service.js's dayBounds — duplicated rather
// than cross-imported since none of these modules export it and it's a
// tiny pure function.
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

// Cosmetic-only display reference — "CDO-YYMMDD-<shiftNo>" — derived from
// the real ShiftSession row's own openedAt/shiftNo, never stored. Unlike
// CashWithdrawal/CashDeposit/CashTransfer, a drawer opening has no
// dedicated reference column of its own: it IS the ShiftSession row (see
// shiftSession.service.js's openShift, reached from the Shift Opening
// screen), which is keyed by its unique [tenantId, outletId, shiftNo]
// instead.
function displayReferenceNo(row) {
  return `CDO-${refDateKey(row.openedAt)}-${row.shiftNo}`;
}

// The "By Time" donut buckets — distinct from the per-row opening-type
// label below (a row can be "Additional Opening" and still fall in the
// "9:00 AM - 12:00 PM" bucket); this is purely a time-of-day slice of the
// day's total opening cash.
const TIME_BUCKET_DEFS = [
  { id: 'before-9am', label: 'Before 9:00 AM', color: '#22A06B', test: (h) => h < 9 },
  { id: '9am-12pm', label: '9:00 AM - 12:00 PM', color: '#F26B21', test: (h) => h >= 9 && h < 12 },
  { id: '12pm-3pm', label: '12:00 PM - 3:00 PM', color: '#2563EB', test: (h) => h >= 12 && h < 15 },
  { id: 'after-3pm', label: 'After 3:00 PM', color: '#8B5CF6', test: (h) => h >= 15 },
];

function timeOfDayLabel(hour) {
  if (hour < 12) return 'Morning';
  if (hour < 16) return 'Afternoon';
  if (hour < 20) return 'Evening';
  return 'Night';
}

// Labels each day's ShiftSession rows in chronological order: the first
// drawer opening of the calendar day is "Shift Start - <time of day>" (a
// genuine new shift beginning); every opening after that on the same day
// is "Additional Opening" (extra float added mid-shift, or a second shift
// opened the same day) — `rowsAsc` must already be sorted openedAt
// ascending for "first of the day" to mean anything.
function withOpeningType(rowsAsc) {
  return rowsAsc.map((row, index) => ({
    ...row,
    openingType: index === 0
      ? `Shift Start - ${timeOfDayLabel(row.openedAt.getHours())}`
      : 'Additional Opening',
  }));
}

/**
 * Powers the Cashier Panel's Cash Drawer Opening report. Unlike Cash
 * Withdrawal/Deposit/Transfer, there is no separate create-flow here — a
 * "drawer opening" IS a ShiftSession row, created by the Shift Opening
 * screen's openShift() — so this module only reads that real data, the
 * same read-only relationship the Cash/Card/UPI Sales and Other Payments
 * reports have with Sale rows created at checkout.
 *
 * - stats.totalDrawerOpenings / totalOpenings / avgOpeningValue are
 *   all-time totals for the cashier's outlet (every ShiftSession ever
 *   opened here, regardless of current OPEN/CLOSED status).
 * - stats.todaysDrawerOpening is always the server's current calendar
 *   day, independent of the `date` filter.
 * - stats.selectedDateOpening / summary / byTime / transactions are all
 *   scoped to `date` (defaults to today), keyed off openedAt.
 * - summary.cashGiven is the real sum of openingCash for the selected
 *   date's openings (identical to stats.selectedDateOpening.value —
 *   surfaced under both names to match the reference's two panels).
 * - summary.closingCashActual is the live running balance of whichever
 *   shift is currently OPEN for this outlet (0 if none): its real opening
 *   cash, plus cash-tender Sale receipts since it opened, minus real
 *   withdrawals/deposits/transfers already taken from it — the same
 *   "available cash" arithmetic createCashWithdrawal/createCashDeposit/
 *   createCashTransfer use to guard their own amount checks. It is not
 *   scoped to `date`, since it reflects the live drawer right now.
 * - summary.variance is always 0.00 by definition: a drawer opening has
 *   nothing to reconcile against yet — the amount recorded IS what was
 *   counted into the drawer (computeTotalOpeningCash already recomputes
 *   it server-side from the denomination grid). A real variance only
 *   exists once a shift is *closed* and its actual counted cash is
 *   compared against what was expected — that belongs to the (not yet
 *   built) Shift Closing report, not here.
 * - byTime/donut are real time-of-day sums for the selected date; a
 *   bucket with no openings that day honestly shows ₹0.00 rather than
 *   being omitted.
 */
export async function getCashDrawerOpeningReport(tenantId, outletId, params = {}) {
  const outletFilter = outletId ? { outletId } : {};
  const { start: dayStart, end: dayEnd } = dayBounds(params.date);
  const { start: todayStart, end: todayEnd } = dayBounds();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  const [allTimeAgg, todaysAgg, dayShiftSessionsAsc, openShift] = await Promise.all([
    prisma.shiftSession.aggregate({
      where: { tenantId, ...outletFilter },
      _sum: { openingCash: true },
      _count: { _all: true },
    }),
    prisma.shiftSession.aggregate({
      where: { tenantId, ...outletFilter, openedAt: { gte: todayStart, lte: todayEnd } },
      _sum: { openingCash: true },
      _count: { _all: true },
    }),
    prisma.shiftSession.findMany({
      where: { tenantId, ...outletFilter, openedAt: { gte: dayStart, lte: dayEnd } },
      orderBy: { openedAt: 'asc' },
    }),
    prisma.shiftSession.findFirst({
      where: { tenantId, ...outletFilter, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    }),
  ]);

  // Deliberately sequential, not folded into the Promise.all above — the
  // pool's real cap is max: 5 (see config/prisma.js), and these only run
  // (up to 3 of them) when a shift is currently open, well within that
  // cap even added to the batch of 4 above since they run after it frees
  // its connections.
  let closingCashActual = 0;
  if (openShift) {
    const cashSalesAgg = await prisma.sale.aggregate({
      where: {
        tenantId, ...outletFilter, paymentMethod: 'cash', createdAt: { gte: openShift.openedAt },
      },
      _sum: { receivedAmount: true },
    });
    const withdrawalsAgg = await prisma.cashWithdrawal.aggregate({
      where: { tenantId, shiftSessionId: openShift.id },
      _sum: { amount: true },
    });
    const depositsAgg = await prisma.cashDeposit.aggregate({
      where: { tenantId, shiftSessionId: openShift.id },
      _sum: { amount: true },
    });
    const transfersAgg = await prisma.cashTransfer.aggregate({
      where: { tenantId, shiftSessionId: openShift.id },
      _sum: { amount: true },
    });
    closingCashActual = round2(
      Number(openShift.openingCash)
        + Number(cashSalesAgg._sum.receivedAmount || 0)
        - Number(withdrawalsAgg._sum.amount || 0)
        - Number(depositsAgg._sum.amount || 0)
        - Number(transfersAgg._sum.amount || 0),
    );
  }

  const totalValue = round2(allTimeAgg._sum.openingCash || 0);
  const totalCount = allTimeAgg._count._all;
  const avgOpeningValue = totalCount > 0 ? totalValue / totalCount : 0;

  const dayRowsWithType = withOpeningType(dayShiftSessionsAsc);
  const totalCashGivenOnDate = round2(dayShiftSessionsAsc.reduce((sum, row) => sum + Number(row.openingCash), 0));
  const distinctCashiers = [...new Set(dayShiftSessionsAsc.map((row) => row.cashierName))];

  const byTime = TIME_BUCKET_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    value: round2(
      dayShiftSessionsAsc
        .filter((row) => def.test(row.openedAt.getHours()))
        .reduce((sum, row) => sum + Number(row.openingCash), 0),
    ),
    color: def.color,
  }));

  // Most-recent-first for the table, same convention as every other
  // cash-movement report — the ascending order above was only needed to
  // label "first of the day" correctly.
  const dayRowsDesc = [...dayRowsWithType].reverse();
  const totalPages = Math.max(Math.ceil(dayRowsDesc.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = dayRowsDesc.slice(pageStart, pageStart + pageSize);

  return {
    stats: {
      totalDrawerOpenings: { value: totalValue, transactions: totalCount },
      totalOpenings: { value: totalCount },
      avgOpeningValue: { value: round2(avgOpeningValue) },
      todaysDrawerOpening: { value: round2(todaysAgg._sum.openingCash || 0), transactions: todaysAgg._count._all },
      selectedDateOpening: { value: totalCashGivenOnDate, date: formatDayLabel(dayStart) },
    },
    summary: {
      totalDrawerOpening: totalCashGivenOnDate,
      totalTransactions: dayShiftSessionsAsc.length,
      totalOpenedBy: distinctCashiers.length ? distinctCashiers.join(', ') : '—',
      cashGiven: totalCashGivenOnDate,
      closingCashActual,
      variance: 0,
    },
    byTime,
    transactions: pageRows.map((row) => ({
      dateTime: row.openedAt,
      referenceNo: displayReferenceNo(row),
      openedBy: row.cashierName,
      openingType: row.openingType,
      amount: round2(Number(row.openingCash)),
      remarks: row.notes || row.description || null,
      status: 'Completed',
    })),
    totalPages,
    page: safePage,
    pageSize,
  };
}
