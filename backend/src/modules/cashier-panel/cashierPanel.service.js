import { prisma } from '../../config/prisma.js';
import { asSale } from '../sale/tczSaleView.js';

// Same three "named" tenders every payment-method report in this app
// splits out — everything else (wallet/credit/store-credit/gift-card/
// cheque/bank-transfer) falls into "Other Payments". Duplicated from
// sale.service.js's PRIMARY_TENDER_METHODS rather than cross-imported, same
// "read-only report module has no cross-module dependency" convention as
// every other cashier-panel service.
const PRIMARY_TENDER_METHODS = ['cash', 'card', 'upi'];

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Midnight-to-midnight bounds for the server's current calendar day — same
// dayBounds() shape as every other cashier-panel report's service, just
// always "today" here since this landing page has no date picker.
function todayBounds() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

// "DD/MM/YYYY hh:mm AM/PM" — matches the reference's "Shift Opened On"
// format exactly (unlike the transaction tables elsewhere, which send a
// raw ISO timestamp and let the component format it — this page's shift
// details panel has always rendered a pre-formatted string, so it's kept
// that way here rather than reshaping the component).
function formatShiftDateTime(date) {
  const d = pad2(date.getDate());
  const m = pad2(date.getMonth() + 1);
  const y = date.getFullYear();
  let hours = date.getHours();
  const minutes = pad2(date.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  if (hours === 0) hours = 12;
  return `${d}/${m}/${y} ${pad2(hours)}:${minutes} ${ampm}`;
}

function timeOnly(date) {
  let hours = date.getHours();
  const minutes = pad2(date.getMinutes());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours %= 12;
  if (hours === 0) hours = 12;
  return `${pad2(hours)}:${minutes} ${ampm}`;
}

// Cosmetic-only display id — "SHF-00027" — derived from the real
// ShiftSession row's own outlet-scoped shiftNo, never stored. Same
// "cosmetic, deterministic, never stored" reasoning as this panel's other
// SC-/CR-/SE- reference prefixes.
function displayShiftId(shift) {
  return `SHF-${String(shift.shiftNo).padStart(5, '0')}`;
}

/**
 * Powers the Cashier Panel landing page — the front-of-house dashboard
 * every other cashier-panel screen is reached from. Every figure here is
 * read directly from real ShiftSession/Sale/SalesReturn/CashWithdrawal/
 * CashDeposit/CashTransfer rows; there is no table or create-flow of its
 * own.
 *
 * - `shift` is the outlet's currently OPEN ShiftSession (null if none is
 *   open) — the same row Shift Opening/Shift Closing work with.
 * - `stats.cashInHand` is this shift's expected cash right now: opening
 *   cash + real cash-tender Sale receipts since it opened − withdrawals −
 *   deposits − transfers, the exact formula closeShift()/getShiftStatus()
 *   already use (0 when no shift is open — there's nothing to count).
 *   There is no live physical recount here (that only happens at Shift
 *   Closing), so `value` and `expected` are always the same number; the
 *   reference's two separate fields are kept for layout parity only.
 * - `stats.todaysSales` / `stats.todaysReceipt` are store-wide (every
 *   cashier, this outlet), not scoped to the shift — same "today, whole
 *   outlet" scope as the Cashier Wise Sales report's stat tiles.
 * - `paymentSummary` splits today's real Sale rows into Cash/Card/UPI/
 *   Other Payments the same way the Cash/Card/UPI/Other Payments reports
 *   do (see sale.service.js's PRIMARY_TENDER_METHODS).
 * - `cashSummary` is null when no shift is open (there's nothing to
 *   summarize). `cashTransferIn` is always 0 — CashTransfer only ever
 *   models cash leaving the drawer (see cashTransfer.service.js's
 *   createCashTransfer doc comment); there's no "transfer in" concept
 *   anywhere in this schema, so this honestly shows ₹0.00 rather than
 *   inventing one.
 * - `recentTransactions` merges the outlet's 5 most recent Sale rows (any
 *   tender) with its 5 most recent CashWithdrawal/CashDeposit rows, then
 *   takes the 5 most recent overall — a real activity feed, not a single
 *   table's tail.
 * - `alerts` are derived from real state (no shift open; a real return
 *   recorded today) rather than the placeholder counts a mock would show.
 */
export async function getCashierPanelSummary(tenantId, outletId) {
  const outletFilter = outletId ? { outletId } : {};
  const saleOutletFilter = outletId ? { tczBill: { outletId } } : {};
  const { start: todayStart, end: todayEnd } = todayBounds();

  // Batch 1 — 5 concurrent queries, at the pool's real max: 5.
  const [
    shift, todaySalesByMethod, todayReturnsAgg, recentSales, recentWithdrawals,
  ] = await Promise.all([
    prisma.shiftSession.findFirst({
      where: { tenantId, ...outletFilter, status: 'OPEN' },
      orderBy: { openedAt: 'desc' },
    }),
    prisma.tczOpos.groupBy({
      by: ['payMode'],
      where: { tenantId, ...outletFilter, createDate: { gte: todayStart, lte: todayEnd } },
      _sum: { grandTotal: true, received: true },
      _count: true,
    }),
    prisma.salesReturn.aggregate({
      where: { tenantId, ...saleOutletFilter, createdAt: { gte: todayStart, lte: todayEnd } },
      _sum: { grandTotal: true },
      _count: true,
    }),
    prisma.tczOpos.findMany({
      where: { tenantId, ...outletFilter },
      orderBy: { createDate: 'desc' },
      take: 5,
      select: { docNum: true, payMode: true, grandTotal: true, createDate: true },
    }),
    prisma.cashWithdrawal.findMany({
      where: { tenantId, ...outletFilter },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { referenceNo: true, amount: true, createdAt: true },
    }),
  ]);

  // Batch 2 — runs only after batch 1 has resolved and freed its
  // connections, so this request never holds more than 5 truly concurrent
  // connections at any moment (see config/prisma.js's real max: 5). The
  // shift-scoped aggregates are only needed (and only queried) when a
  // shift is actually open — there's nothing to sum otherwise.
  const batch2 = [
    prisma.cashDeposit.findMany({
      where: { tenantId, ...outletFilter },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { referenceNo: true, amount: true, createdAt: true },
    }),
  ];
  if (shift) {
    batch2.push(
      prisma.tczOpos.aggregate({
        where: {
          tenantId, ...outletFilter, payMode: 'cash', createDate: { gte: shift.openedAt },
        },
        _sum: { received: true },
      }),
      prisma.cashWithdrawal.aggregate({ where: { tenantId, shiftSessionId: shift.id }, _sum: { amount: true } }),
      prisma.cashDeposit.aggregate({ where: { tenantId, shiftSessionId: shift.id }, _sum: { amount: true } }),
      prisma.cashTransfer.aggregate({ where: { tenantId, shiftSessionId: shift.id }, _sum: { amount: true } }),
    );
  }
  const [recentDeposits, cashSalesAgg, withdrawalsAgg, depositsAgg, transfersAgg] = await Promise.all(batch2);

  // Payment Summary (Today) — bucket every group returned by the groupBy
  // above into cash/card/upi/other, same split as the Cash/Card/UPI/Other
  // Payments reports.
  let cashValue = 0;
  let cardValue = 0;
  let upiValue = 0;
  let otherValue = 0;
  let receivedToday = 0;
  let transactionsToday = 0;
  todaySalesByMethod.forEach((row) => {
    const grand = Number(row._sum.grandTotal || 0);
    receivedToday += Number(row._sum.received || 0);
    transactionsToday += row._count;
    if (row.payMode === 'cash') cashValue += grand;
    else if (row.payMode === 'card') cardValue += grand;
    else if (row.payMode === 'upi') upiValue += grand;
    else otherValue += grand;
  });
  const totalSalesToday = round2(cashValue + cardValue + upiValue + otherValue);

  const paymentSummary = {
    breakdown: [
      { key: 'cash', label: 'Cash Sales', value: round2(cashValue), color: '#22A06B' },
      { key: 'card', label: 'Card Sales', value: round2(cardValue), color: '#2563EB' },
      { key: 'upi', label: 'UPI Sales', value: round2(upiValue), color: '#8B5CF6' },
      { key: 'other', label: 'Other Payments', value: round2(otherValue), color: '#1F2A3C' },
    ],
    totalSales: totalSalesToday,
  };

  // Cash Summary (Today) — only meaningful while a shift is open; there is
  // nothing in the drawer to summarize otherwise.
  let cashSummary = null;
  let expectedCashInHand = 0;
  if (shift) {
    const openingCash = round2(Number(shift.openingCash));
    const cashReceived = round2(cashSalesAgg._sum.received || 0);
    const cashWithdrawal = round2(withdrawalsAgg._sum.amount || 0);
    const cashDeposit = round2(depositsAgg._sum.amount || 0);
    const cashTransferOut = round2(transfersAgg._sum.amount || 0);
    expectedCashInHand = round2(openingCash + cashReceived - cashWithdrawal - cashDeposit - cashTransferOut);
    cashSummary = {
      openingCash,
      cashReceived,
      cashWithdrawal,
      cashDeposit,
      // Always ₹0.00 — see this function's doc comment: CashTransfer only
      // ever models cash leaving the drawer, so there's no real
      // "transfer in" figure to report.
      cashTransferIn: 0,
      cashTransferOut,
      expectedCashInHand,
    };
  }

  // Recent Transactions — merge the outlet's most recent Sale/
  // CashWithdrawal/CashDeposit rows into one feed, most recent first.
  const saleTypeFor = (paymentMethod) => {
    if (paymentMethod === 'cash') return { type: 'Cash Sale', color: '#22A06B' };
    if (paymentMethod === 'card') return { type: 'Card Sale', color: '#2563EB' };
    if (paymentMethod === 'upi') return { type: 'UPI Sale', color: '#8B5CF6' };
    return { type: 'Other Sale', color: '#1F2A3C' };
  };
  const merged = [
    ...recentSales.map(asSale).map((row) => {
      const { type, color } = saleTypeFor(row.paymentMethod);
      return {
        id: row.billNo, type, ref: row.billNo, time: timeOnly(row.createdAt), amount: round2(row.grandTotal), color, at: row.createdAt,
      };
    }),
    ...recentWithdrawals.map((row) => ({
      id: row.referenceNo, type: 'Cash Withdrawal', ref: row.referenceNo, time: timeOnly(row.createdAt), amount: round2(row.amount), color: '#F26B21', at: row.createdAt,
    })),
    ...recentDeposits.map((row) => ({
      id: row.referenceNo, type: 'Cash Deposit', ref: row.referenceNo, time: timeOnly(row.createdAt), amount: round2(row.amount), color: '#22A06B', at: row.createdAt,
    })),
  ];
  const recentTransactions = merged
    .sort((a, b) => new Date(b.at) - new Date(a.at))
    .slice(0, 5)
    .map(({ at, ...row }) => row);

  // Alerts — real, derived state rather than placeholder counts.
  const alerts = [];
  if (!shift) {
    alerts.push({ severity: 'error', message: 'No shift is currently open. Open a shift before recording any sales.' });
  } else {
    alerts.push({ severity: 'info', message: 'Reconcile your cash and close this shift at the end of the day.' });
  }
  const returnsCount = todayReturnsAgg._count;
  if (returnsCount > 0) {
    const returnsValue = round2(todayReturnsAgg._sum.grandTotal || 0);
    alerts.push({
      severity: 'info',
      message: `${returnsCount} return${returnsCount === 1 ? '' : 's'} recorded today, totalling ₹${returnsValue.toFixed(2)}.`,
    });
  }

  return {
    shift: shift ? {
      id: displayShiftId(shift),
      openedOn: formatShiftDateTime(shift.openedAt),
      cashier: shift.cashierName,
      openingCash: round2(Number(shift.openingCash)),
      openingCashBy: shift.cashierName,
      status: shift.status,
    } : null,
    stats: {
      cashInHand: { value: expectedCashInHand, expected: expectedCashInHand },
      todaysSales: { value: totalSalesToday, transactions: transactionsToday },
      todaysReceipt: { value: round2(receivedToday), refunds: round2(todayReturnsAgg._sum.grandTotal || 0) },
    },
    paymentSummary,
    cashSummary,
    recentTransactions,
    alerts,
  };
}
