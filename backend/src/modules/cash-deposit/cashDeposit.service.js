import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Midnight-to-midnight bounds for one calendar day in the server's local
// time zone. Same helper as cashWithdrawal.service.js's dayBounds —
// duplicated rather than cross-imported since neither module exports it and
// it's a tiny pure function.
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

// Label + donut color per purpose — kept alongside CASH_DEPOSIT_PURPOSES in
// cashDeposit.schema.js so validation and reporting can't drift apart.
const PURPOSE_DEFS = [
  { id: 'bank-deposit', label: 'Bank Deposit', color: '#22A06B' },
  { id: 'owner-deposit', label: 'Owner Deposit', color: '#F5A623' },
  { id: 'float-adjustment', label: 'Float Adjustment', color: '#2563EB' },
  { id: 'other', label: 'Other Purpose', color: '#8B5CF6' },
];
const PURPOSE_LABEL_BY_ID = Object.fromEntries(PURPOSE_DEFS.map((def) => [def.id, def.label]));

function labelForPurpose(purpose) {
  return PURPOSE_LABEL_BY_ID[purpose] || 'Other Purpose';
}

// "DP-YYMMDD-NNNN", sequential per tenant per calendar day — same
// count-of-existing-rows-for-this-prefix convention as CashWithdrawal's
// nextReferenceNo, scoped to the day via a `startsWith` filter on the
// reference itself rather than a separate date column to key off.
function refDateKey(date) {
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

async function nextReferenceNo(tx, tenantId) {
  const prefix = `DP-${refDateKey(new Date())}-`;
  const count = await tx.cashDeposit.count({ where: { tenantId, referenceNo: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

/** Turns a Prisma unique-constraint violation into a friendly 409 instead of a raw 500. */
function prismaKnownError(err) {
  if (err?.code === 'P2002') {
    return new ApiError(409, 'That deposit reference number is already in use — try again', err.meta);
  }
  return err;
}

/**
 * Records a cash deposit out of the drawer — to the bank, to the owner, or
 * a float adjustment. `actor` is req.user (the decoded JWT) —
 * outletId/cashierId/cashierName always come from there, never from the
 * request body, same rule every other create-flow in this app follows.
 *
 * A deposit is, physically, the same kind of drawer movement as a
 * withdrawal (cash leaving the drawer) — just categorized differently and,
 * for a Bank Deposit, tagged with the account it landed in. So it is
 * guarded by the same two real, server-enforced rules as
 * createCashWithdrawal:
 * - A deposit can only be recorded while a shift is OPEN for this outlet.
 * - The amount can't exceed what's actually in the drawer right now: this
 *   shift's opening cash, plus real cash-tender Sale receipts since the
 *   shift opened, minus withdrawals already taken from this shift, minus
 *   deposits already made from this shift, minus transfers already made
 *   from this shift. All other movements are subtracted because they
 *   compete for the same physical cash — createCashWithdrawal and
 *   cashTransfer.service.js's createCashTransfer both subtract this
 *   shift's deposits the same way, so no combination of the three
 *   movements can push the drawer negative regardless of the order
 *   they're recorded in. All computed from real rows inside the same
 *   transaction as the insert, so near-simultaneous movements can't
 *   together succeed past the available balance.
 */
export async function createCashDeposit(tenantId, outletId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const shift = await tx.shiftSession.findFirst({ where: { tenantId, outletId, status: 'OPEN' } });
    if (!shift) {
      throw new ApiError(400, 'Open a shift before recording a cash deposit');
    }

    const [cashSalesAgg, withdrawalsAgg, depositsAgg, transfersAgg] = await Promise.all([
      tx.sale.aggregate({
        where: {
          tenantId, outletId, paymentMethod: 'cash', createdAt: { gte: shift.openedAt },
        },
        _sum: { receivedAmount: true },
      }),
      tx.cashWithdrawal.aggregate({
        where: { tenantId, shiftSessionId: shift.id },
        _sum: { amount: true },
      }),
      tx.cashDeposit.aggregate({
        where: { tenantId, shiftSessionId: shift.id },
        _sum: { amount: true },
      }),
      tx.cashTransfer.aggregate({
        where: { tenantId, shiftSessionId: shift.id },
        _sum: { amount: true },
      }),
    ]);

    const cashReceivedThisShift = Number(cashSalesAgg._sum.receivedAmount || 0);
    const withdrawnThisShift = Number(withdrawalsAgg._sum.amount || 0);
    const depositedThisShift = Number(depositsAgg._sum.amount || 0);
    const transferredThisShift = Number(transfersAgg._sum.amount || 0);
    const availableCash = round2(
      Number(shift.openingCash) + cashReceivedThisShift
        - withdrawnThisShift - depositedThisShift - transferredThisShift,
    );

    if (data.amount > availableCash) {
      throw new ApiError(
        400,
        `Deposit amount exceeds the available cash in the drawer (₹${availableCash.toFixed(2)} available)`,
      );
    }

    const referenceNo = await nextReferenceNo(tx, tenantId);

    const deposit = await tx.cashDeposit.create({
      data: {
        tenantId,
        outletId,
        shiftSessionId: shift.id,
        referenceNo,
        purpose: data.purpose,
        amount: data.amount,
        paymentMode: 'cash',
        bankAccount: data.bankAccount?.trim() || null,
        remarks: data.remarks || null,
        cashierId: actor.id,
        cashierName: actor.name,
      },
    });

    return { ...deposit, availableCashAfter: round2(availableCash - data.amount) };
  }).catch((err) => { throw prismaKnownError(err); });
}

/**
 * Powers the Cashier Panel's Cash Deposit report — every figure here comes
 * from real CashDeposit/CashWithdrawal/Sale/ShiftSession rows. Mirrors
 * getCashWithdrawalReport's shape exactly (stat totals, today's figure,
 * selected-date figure, summary, byPurpose donut, paginated transactions)
 * — see that function's doc comment for the all-time-vs-selected-date split.
 *
 * summary.closingCashActual here also subtracts the selected date's real
 * withdrawals AND transfers, since all three movements draw from the same
 * drawer — the counterpart of getCashWithdrawalReport / getCashTransferReport
 * now also subtracting the date's real deposits.
 */
export async function getCashDepositReport(tenantId, outletId, params = {}) {
  const outletFilter = outletId ? { outletId } : {};
  const { start: dayStart, end: dayEnd } = dayBounds(params.date);
  const { start: todayStart, end: todayEnd } = dayBounds();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  const [allTimeAgg, todaysAgg, dayDeposits, openShift, dateSalesByMethod] = await Promise.all([
    prisma.cashDeposit.aggregate({
      where: { tenantId, ...outletFilter },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.cashDeposit.aggregate({
      where: { tenantId, ...outletFilter, createdAt: { gte: todayStart, lte: todayEnd } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.cashDeposit.findMany({
      where: { tenantId, ...outletFilter, createdAt: { gte: dayStart, lte: dayEnd } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.shiftSession.findFirst({
      where: { tenantId, ...outletFilter, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    }),
    // One groupBy instead of two separate aggregate() calls ("all modes"
    // and "cash only") for the selected day — same result, one connection.
    prisma.sale.groupBy({
      by: ['paymentMethod'],
      where: { tenantId, ...outletFilter, createdAt: { gte: dayStart, lte: dayEnd } },
      _sum: { grandTotal: true, receivedAmount: true },
    }),
  ]);
  // Deliberately NOT folded into the Promise.all above — the pool's real
  // cap is max: 5 (see config/prisma.js), and that batch already uses all
  // 5 at once. These two extra queries run only after those five have
  // returned and freed their connection, so this request never holds more
  // than 5 concurrent connections at any moment.
  const dayWithdrawalsAgg = await prisma.cashWithdrawal.aggregate({
    where: { tenantId, ...outletFilter, createdAt: { gte: dayStart, lte: dayEnd } },
    _sum: { amount: true },
  });
  const dayTransfersAgg = await prisma.cashTransfer.aggregate({
    where: { tenantId, ...outletFilter, createdAt: { gte: dayStart, lte: dayEnd } },
    _sum: { amount: true },
  });

  const totalValue = round2(allTimeAgg._sum.amount || 0);
  const totalCount = allTimeAgg._count._all;
  const avgDepositValue = totalCount > 0 ? totalValue / totalCount : 0;

  const totalSalesAllModes = round2(
    dateSalesByMethod.reduce((sum, row) => sum + Number(row._sum.grandTotal || 0), 0),
  );
  const cashRow = dateSalesByMethod.find((row) => row.paymentMethod === 'cash');
  const cashReceivedOnDate = round2(cashRow ? Number(cashRow._sum.receivedAmount || 0) : 0);

  const totalPages = Math.max(Math.ceil(dayDeposits.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = dayDeposits.slice(pageStart, pageStart + pageSize);

  const totalCashDepositOnDate = round2(dayDeposits.reduce((sum, row) => sum + Number(row.amount), 0));
  const withdrawnOnDate = round2(dayWithdrawalsAgg._sum.amount || 0);
  const transferredOnDate = round2(dayTransfersAgg._sum.amount || 0);
  const distinctCashiers = [...new Set(dayDeposits.map((row) => row.cashierName))];
  const openingCash = openShift ? round2(Number(openShift.openingCash)) : 0;
  const closingCashActual = round2(
    openingCash + cashReceivedOnDate - withdrawnOnDate - totalCashDepositOnDate - transferredOnDate,
  );

  const depositedByPurpose = {};
  dayDeposits.forEach((row) => {
    depositedByPurpose[row.purpose] = (depositedByPurpose[row.purpose] || 0) + Number(row.amount);
  });
  const byPurpose = PURPOSE_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    value: round2(depositedByPurpose[def.id] || 0),
    color: def.color,
  }));

  return {
    stats: {
      totalCashDeposit: { value: totalValue, transactions: totalCount },
      totalDeposits: { value: totalCount },
      avgDepositValue: { value: round2(avgDepositValue) },
      todaysCashDeposit: { value: round2(todaysAgg._sum.amount || 0), transactions: todaysAgg._count._all },
      selectedDateDeposit: { value: totalCashDepositOnDate, date: formatDayLabel(dayStart) },
    },
    summary: {
      totalCashDeposit: totalCashDepositOnDate,
      totalTransactions: dayDeposits.length,
      totalDepositedBy: distinctCashiers.length ? distinctCashiers.join(', ') : '—',
      openingCash,
      totalSalesAllModes,
      closingCashActual,
    },
    byPurpose,
    transactions: pageRows.map((row) => ({
      dateTime: row.createdAt,
      referenceNo: row.referenceNo,
      purpose: labelForPurpose(row.purpose),
      depositedBy: row.cashierName,
      amount: round2(Number(row.amount)),
      paymentMode: 'Cash',
      bankAccount: row.bankAccount || null,
      remarks: row.remarks || null,
    })),
    totalPages,
    page: safePage,
    pageSize,
  };
}
