import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { asSaleGroup } from '../sale/tczSaleView.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Midnight-to-midnight bounds for one calendar day in the server's local
// time zone. `dateStr` is a "YYYY-MM-DD" string (validated by
// cashWithdrawalQuerySchema); omitted, it defaults to today. Same helper as
// sale.service.js's dayBounds — duplicated rather than cross-imported since
// neither module exports it and it's a tiny pure function.
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

// Label + donut color per purpose — kept alongside CASH_WITHDRAWAL_PURPOSES
// in cashWithdrawal.schema.js so validation and reporting can't drift apart.
const PURPOSE_DEFS = [
  { id: 'bank-deposit', label: 'Bank Deposit', color: '#22A06B' },
  { id: 'owner-withdrawal', label: 'Owner Withdrawal', color: '#F5A623' },
  { id: 'petty-cash', label: 'Petty Cash', color: '#2563EB' },
  { id: 'other', label: 'Other Purpose', color: '#8B5CF6' },
];
const PURPOSE_LABEL_BY_ID = Object.fromEntries(PURPOSE_DEFS.map((def) => [def.id, def.label]));

function labelForPurpose(purpose) {
  return PURPOSE_LABEL_BY_ID[purpose] || 'Other Purpose';
}

// "WD-YYMMDD-NNNN", sequential per tenant per calendar day — same
// count-of-existing-rows-for-this-prefix convention as Sale's nextBillNo,
// scoped to the day via a `startsWith` filter on the reference itself
// rather than a separate date column to key off.
function refDateKey(date) {
  const y = String(date.getFullYear()).slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

async function nextReferenceNo(tx, tenantId) {
  const prefix = `WD-${refDateKey(new Date())}-`;
  const count = await tx.cashWithdrawal.count({ where: { tenantId, referenceNo: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

/** Turns a Prisma unique-constraint violation into a friendly 409 instead of a raw 500. */
function prismaKnownError(err) {
  if (err?.code === 'P2002') {
    return new ApiError(409, 'That withdrawal reference number is already in use — try again', err.meta);
  }
  return err;
}

/**
 * Records a cash withdrawal from the drawer. `actor` is req.user (the
 * decoded JWT) — outletId/cashierId/cashierName always come from there,
 * never from the request body, same rule every other create-flow in this
 * app follows.
 *
 * Two real, server-enforced guards (both re-checked here even though the
 * frontend also checks them, since the frontend's check is only a
 * courtesy):
 * - A withdrawal can only be recorded while a shift is OPEN for this
 *   outlet — there's no cash drawer to take money out of otherwise.
 * - The amount can't exceed what's actually in the drawer right now:
 *   this shift's opening cash, plus real cash-tender Sale receipts since
 *   the shift opened, minus withdrawals already taken from this same
 *   shift, minus deposits already made from this same shift, minus
 *   transfers already made from this same shift (Cash Deposit and Cash
 *   Transfer are also cash leaving the drawer — see cashDeposit.service.js's
 *   createCashDeposit and cashTransfer.service.js's createCashTransfer,
 *   which both subtract this shift's withdrawals the same way, so no
 *   combination of the three movements can push the drawer negative
 *   regardless of the order they're recorded in). All computed from real
 *   rows inside the same transaction as the insert, so near-simultaneous
 *   movements can't together succeed past the available balance.
 */
export async function createCashWithdrawal(tenantId, outletId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const shift = await tx.shiftSession.findFirst({ where: { tenantId, outletId, status: 'OPEN' } });
    if (!shift) {
      throw new ApiError(400, 'Open a shift before recording a cash withdrawal');
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
        `Withdrawal amount exceeds the available cash in the drawer (₹${availableCash.toFixed(2)} available)`,
      );
    }

    const referenceNo = await nextReferenceNo(tx, tenantId);

    const withdrawal = await tx.cashWithdrawal.create({
      data: {
        tenantId,
        outletId,
        shiftSessionId: shift.id,
        referenceNo,
        purpose: data.purpose,
        amount: data.amount,
        paymentMode: 'cash',
        remarks: data.remarks || null,
        cashierId: actor.id,
        cashierName: actor.name,
      },
    });

    return { ...withdrawal, availableCashAfter: round2(availableCash - data.amount) };
  }).catch((err) => { throw prismaKnownError(err); });
}

/**
 * Powers the Cashier Panel's Cash Withdrawal report — every figure here
 * comes from real CashWithdrawal/Sale/ShiftSession rows:
 *
 * - stats.totalCashWithdrawal / totalWithdrawals / avgWithdrawalValue are
 *   all-time totals for the cashier's outlet.
 * - stats.todaysWithdrawal is always the server's current calendar day,
 *   independent of the `date` filter.
 * - stats.selectedDateWithdrawal / summary / byPurpose / transactions are
 *   all scoped to `date` (defaults to today).
 * - summary.openingCash is the outlet's currently OPEN shift's real opening
 *   float (0 if no shift is open) — not scoped to `date`, since it reflects
 *   the live drawer, matching the reference's always-current framing.
 * - summary.totalSalesAllModes is the real sum of every Sale's grandTotal
 *   (any tender) on the selected date; summary.closingCashActual is
 *   openingCash + real cash-tender receipts on the selected date − real
 *   withdrawals on the selected date − real deposits on the selected date
 *   − real transfers on the selected date (Cash Deposit and Cash Transfer
 *   both draw from the same drawer — see cashDeposit.service.js's and
 *   cashTransfer.service.js's own report functions, whose closingCashActual
 *   now subtract the date's withdrawals the same way). This is an honest
 *   reconstruction from real rows across all three movement types.
 * - byPurpose/donut are real per-purpose sums for the selected date; a
 *   purpose with no withdrawals that day honestly shows ₹0.00 rather than
 *   being omitted.
 */
export async function getCashWithdrawalReport(tenantId, outletId, params = {}) {
  const outletFilter = outletId ? { outletId } : {};
  const { start: dayStart, end: dayEnd } = dayBounds(params.date);
  const { start: todayStart, end: todayEnd } = dayBounds();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  const [allTimeAgg, todaysAgg, dayWithdrawals, openShift, dateSalesByMethod] = await Promise.all([
    prisma.cashWithdrawal.aggregate({
      where: { tenantId, ...outletFilter },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.cashWithdrawal.aggregate({
      where: { tenantId, ...outletFilter, createdAt: { gte: todayStart, lte: todayEnd } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    prisma.cashWithdrawal.findMany({
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
  const dayDepositsAgg = await prisma.cashDeposit.aggregate({
    where: { tenantId, ...outletFilter, createdAt: { gte: dayStart, lte: dayEnd } },
    _sum: { amount: true },
  });
  const dayTransfersAgg = await prisma.cashTransfer.aggregate({
    where: { tenantId, ...outletFilter, createdAt: { gte: dayStart, lte: dayEnd } },
    _sum: { amount: true },
  });

  const totalValue = round2(allTimeAgg._sum.amount || 0);
  const totalCount = allTimeAgg._count._all;
  const avgWithdrawalValue = totalCount > 0 ? totalValue / totalCount : 0;

  const totalSalesAllModes = round2(
    dateSalesByMethod.reduce((sum, row) => sum + Number(row._sum.grandTotal || 0), 0),
  );
  const cashRow = dateSalesByMethod.find((row) => row.paymentMethod === 'cash');
  const cashReceivedOnDate = round2(cashRow ? Number(cashRow._sum.receivedAmount || 0) : 0);

  const totalPages = Math.max(Math.ceil(dayWithdrawals.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = dayWithdrawals.slice(pageStart, pageStart + pageSize);

  const totalCashWithdrawalOnDate = round2(dayWithdrawals.reduce((sum, row) => sum + Number(row.amount), 0));
  const depositedOnDate = round2(dayDepositsAgg._sum.amount || 0);
  const transferredOnDate = round2(dayTransfersAgg._sum.amount || 0);
  const distinctCashiers = [...new Set(dayWithdrawals.map((row) => row.cashierName))];
  const openingCash = openShift ? round2(Number(openShift.openingCash)) : 0;
  const closingCashActual = round2(
    openingCash + cashReceivedOnDate - totalCashWithdrawalOnDate - depositedOnDate - transferredOnDate,
  );

  const withdrawnByPurpose = {};
  dayWithdrawals.forEach((row) => {
    withdrawnByPurpose[row.purpose] = (withdrawnByPurpose[row.purpose] || 0) + Number(row.amount);
  });
  const byPurpose = PURPOSE_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    value: round2(withdrawnByPurpose[def.id] || 0),
    color: def.color,
  }));

  return {
    stats: {
      totalCashWithdrawal: { value: totalValue, transactions: totalCount },
      totalWithdrawals: { value: totalCount },
      avgWithdrawalValue: { value: round2(avgWithdrawalValue) },
      todaysWithdrawal: { value: round2(todaysAgg._sum.amount || 0), transactions: todaysAgg._count._all },
      selectedDateWithdrawal: { value: totalCashWithdrawalOnDate, date: formatDayLabel(dayStart) },
    },
    summary: {
      totalCashWithdrawal: totalCashWithdrawalOnDate,
      totalTransactions: dayWithdrawals.length,
      totalWithdrawnBy: distinctCashiers.length ? distinctCashiers.join(', ') : '—',
      openingCash,
      totalSalesAllModes,
      closingCashActual,
    },
    byPurpose,
    transactions: pageRows.map((row) => ({
      dateTime: row.createdAt,
      referenceNo: row.referenceNo,
      purpose: labelForPurpose(row.purpose),
      withdrawnBy: row.cashierName,
      amount: round2(Number(row.amount)),
      paymentMode: 'Cash',
      remarks: row.remarks || null,
    })),
    totalPages,
    page: safePage,
    pageSize,
  };
}
