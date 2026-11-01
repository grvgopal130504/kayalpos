import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { asSaleGroup } from '../sale/tczSaleView.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Midnight-to-midnight bounds for one calendar day in the server's local
// time zone. Same helper as cashWithdrawal.service.js's / cashDeposit.
// service.js's dayBounds — duplicated rather than cross-imported since
// none of these modules export it and it's a tiny pure function.
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

// Label + donut color per purpose — kept alongside CASH_TRANSFER_PURPOSES
// in cashTransfer.schema.js so validation and reporting can't drift apart.
const PURPOSE_DEFS = [
  { id: 'bank-deposit', label: 'Bank Deposit', color: '#22A06B' },
  { id: 'petty-cash', label: 'Petty Cash', color: '#F5A623' },
  { id: 'change-fund', label: 'Change Fund', color: '#2563EB' },
  { id: 'other', label: 'Other Purpose', color: '#8B5CF6' },
];
const PURPOSE_LABEL_BY_ID = Object.fromEntries(PURPOSE_DEFS.map((def) => [def.id, def.label]));

function labelForPurpose(purpose) {
  return PURPOSE_LABEL_BY_ID[purpose] || 'Other Purpose';
}

// "CT-YYMMDD-NNNN", sequential per tenant per calendar day — same
// count-of-existing-rows-for-this-prefix convention as CashWithdrawal's /
// CashDeposit's nextReferenceNo, scoped to the day via a `startsWith`
// filter on the reference itself rather than a separate date column.
function refDateKey(date) {
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

async function nextReferenceNo(tx, tenantId) {
  const prefix = `CT-${refDateKey(new Date())}-`;
  const count = await tx.cashTransfer.count({ where: { tenantId, referenceNo: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

/** Turns a Prisma unique-constraint violation into a friendly 409 instead of a raw 500. */
function prismaKnownError(err) {
  if (err?.code === 'P2002') {
    return new ApiError(409, 'That transfer reference number is already in use — try again', err.meta);
  }
  return err;
}

/**
 * Records a cash transfer out of the drawer to a named destination (a bank
 * account, the petty cash box, the change fund box, or another named
 * place — "from" is always the drawer itself, so only the destination is
 * collected). `actor` is req.user (the decoded JWT) —
 * outletId/cashierId/cashierName always come from there, never from the
 * request body, same rule every other create-flow in this app follows.
 *
 * A transfer is, physically, the same kind of drawer movement as a
 * withdrawal or deposit (cash leaving the drawer) — just categorized
 * differently and always tagged with where it went. So it is guarded by
 * the same two real, server-enforced rules as createCashWithdrawal /
 * createCashDeposit:
 * - A transfer can only be recorded while a shift is OPEN for this outlet.
 * - The amount can't exceed what's actually in the drawer right now: this
 *   shift's opening cash, plus real cash-tender Sale receipts since the
 *   shift opened, minus withdrawals already taken from this shift, minus
 *   deposits already made from this shift, minus transfers already made
 *   from this shift. All three other movements are subtracted because
 *   they compete for the same physical cash — createCashWithdrawal and
 *   createCashDeposit now subtract this shift's transfers the same way,
 *   so no combination of the three can push the drawer negative
 *   regardless of the order they're recorded in. All computed from real
 *   rows inside the same transaction as the insert, so near-simultaneous
 *   movements can't together succeed past the available balance.
 */
export async function createCashTransfer(tenantId, outletId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const shift = await tx.shiftSession.findFirst({ where: { tenantId, outletId, status: 'OPEN' } });
    if (!shift) {
      throw new ApiError(400, 'Open a shift before recording a cash transfer');
    }

    const [cashSalesAgg, withdrawalsAgg, depositsAgg, transfersAgg] = await Promise.all([
      tx.tczOpos.aggregate({
        where: {
          tenantId, outletId, payMode: 'cash', createDate: { gte: shift.openedAt },
        },
        _sum: { received: true },
      }).then(asSaleGroup),
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
        `Transfer amount exceeds the available cash in the drawer (₹${availableCash.toFixed(2)} available)`,
      );
    }

    const referenceNo = await nextReferenceNo(tx, tenantId);

    const transfer = await tx.cashTransfer.create({
      data: {
        tenantId,
        outletId,
        shiftSessionId: shift.id,
        referenceNo,
        purpose: data.purpose,
        toLocation: data.toLocation.trim(),
        amount: data.amount,
        paymentMode: 'cash',
        remarks: data.remarks || null,
        cashierId: actor.id,
        cashierName: actor.name,
      },
    });

    return { ...transfer, availableCashAfter: round2(availableCash - data.amount) };
  }).catch((err) => { throw prismaKnownError(err); });
}

/**
 * Powers the Cashier Panel's Cash Transfer report — every figure here
 * comes from real CashTransfer/CashWithdrawal/CashDeposit/Sale/
 * ShiftSession rows. Mirrors getCashWithdrawalReport's / getCashDepositReport's
 * shape exactly (stat totals, today's figure, selected-date figure,
 * summary, byPurpose donut, paginated transactions) — see those
 * functions' doc comments for the all-time-vs-selected-date split.
 *
 * summary.closingCashActual here also subtracts the selected date's real
 * withdrawals AND deposits, since all three movements draw from the same
 * drawer — the counterpart of getCashWithdrawalReport / getCashDepositReport
 * now also subtracting the date's real transfers.
 */
export async function getCashTransferReport(tenantId, outletId, params = {}) {
  const outletFilter = outletId ? { outletId } : {};
  const { start: dayStart, end: dayEnd } = dayBounds(params.date);
  const { start: todayStart, end: todayEnd } = dayBounds();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  const [allTimeAgg, todaysAgg, dayTransfers, openShift, dateSalesByMethod] = await Promise.all([
    prisma.cashTransfer.aggregate({
      where: { tenantId, ...outletFilter },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.cashTransfer.aggregate({
      where: { tenantId, ...outletFilter, createdAt: { gte: todayStart, lte: todayEnd } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.cashTransfer.findMany({
      where: { tenantId, ...outletFilter, createdAt: { gte: dayStart, lte: dayEnd } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.shiftSession.findFirst({
      where: { tenantId, ...outletFilter, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    }),
    // One groupBy instead of two separate aggregate() calls ("all modes"
    // and "cash only") for the selected day — same result, one connection.
    prisma.tczOpos.groupBy({
      by: ['payMode'],
      where: { tenantId, ...outletFilter, createDate: { gte: dayStart, lte: dayEnd } },
      _sum: { grandTotal: true, received: true },
    }).then((rows) => rows.map(asSaleGroup)),
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
  const dayDepositsAgg = await prisma.cashDeposit.aggregate({
    where: { tenantId, ...outletFilter, createdAt: { gte: dayStart, lte: dayEnd } },
    _sum: { amount: true },
  });

  const totalValue = round2(allTimeAgg._sum.amount || 0);
  const totalCount = allTimeAgg._count._all;
  const avgTransferValue = totalCount > 0 ? totalValue / totalCount : 0;

  const totalSalesAllModes = round2(
    dateSalesByMethod.reduce((sum, row) => sum + Number(row._sum.grandTotal || 0), 0),
  );
  const cashRow = dateSalesByMethod.find((row) => row.paymentMethod === 'cash');
  const cashReceivedOnDate = round2(cashRow ? Number(cashRow._sum.receivedAmount || 0) : 0);

  const totalPages = Math.max(Math.ceil(dayTransfers.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = dayTransfers.slice(pageStart, pageStart + pageSize);

  const totalCashTransferOnDate = round2(dayTransfers.reduce((sum, row) => sum + Number(row.amount), 0));
  const withdrawnOnDate = round2(dayWithdrawalsAgg._sum.amount || 0);
  const depositedOnDate = round2(dayDepositsAgg._sum.amount || 0);
  const distinctCashiers = [...new Set(dayTransfers.map((row) => row.cashierName))];
  const openingCash = openShift ? round2(Number(openShift.openingCash)) : 0;
  const closingCashActual = round2(
    openingCash + cashReceivedOnDate - withdrawnOnDate - depositedOnDate - totalCashTransferOnDate,
  );

  const transferredByPurpose = {};
  dayTransfers.forEach((row) => {
    transferredByPurpose[row.purpose] = (transferredByPurpose[row.purpose] || 0) + Number(row.amount);
  });
  const byPurpose = PURPOSE_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    value: round2(transferredByPurpose[def.id] || 0),
    color: def.color,
  }));

  return {
    stats: {
      totalCashTransfer: { value: totalValue, transactions: totalCount },
      totalTransfers: { value: totalCount },
      avgTransferValue: { value: round2(avgTransferValue) },
      todaysCashTransfer: { value: round2(todaysAgg._sum.amount || 0), transactions: todaysAgg._count._all },
      selectedDateTransfer: { value: totalCashTransferOnDate, date: formatDayLabel(dayStart) },
    },
    summary: {
      totalCashTransfer: totalCashTransferOnDate,
      totalTransactions: dayTransfers.length,
      totalTransferredBy: distinctCashiers.length ? distinctCashiers.join(', ') : '—',
      openingCash,
      totalSalesAllModes,
      closingCashActual,
    },
    byPurpose,
    transactions: pageRows.map((row) => ({
      dateTime: row.createdAt,
      referenceNo: row.referenceNo,
      from: 'Cash Counter',
      to: row.toLocation,
      purpose: labelForPurpose(row.purpose),
      transferredBy: row.cashierName,
      amount: round2(Number(row.amount)),
      paymentMode: 'Cash',
      remarks: row.remarks || null,
    })),
    totalPages,
    page: safePage,
    pageSize,
  };
}
