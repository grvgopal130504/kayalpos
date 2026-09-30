import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { EXPENSE_PAYMENT_MODES } from './expense.schema.js';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Label + donut color per category — kept alongside EXPENSE_CATEGORIES in
// expense.schema.js so validation and reporting can't drift apart. Same
// colors expensesBookMockData.js's byCategory used, so the donut looks the
// same now that it's fed by real rows.
const CATEGORY_DEFS = [
  { id: 'purchase-stock', label: 'Purchase / Stock', color: '#2563EB' },
  { id: 'rent', label: 'Rent', color: '#22A06B' },
  { id: 'utilities', label: 'Utilities', color: '#F26B21' },
  { id: 'salaries', label: 'Salaries', color: '#8B5CF6' },
  { id: 'transport', label: 'Transport', color: '#0EA5A4' },
  { id: 'repair-maintenance', label: 'Repair & Maintenance', color: '#EC4899' },
  { id: 'office-expenses', label: 'Office Expenses', color: '#F5A623' },
];

// Label + donut color per payment mode — same colors
// expensesBookMockData.js's byPaymentMode used.
const PAYMENT_MODE_DEFS = [
  { id: 'cash', label: 'Cash', color: '#22A06B' },
  { id: 'bank-transfer', label: 'Bank Transfer', color: '#2563EB' },
  { id: 'upi', label: 'UPI', color: '#8B5CF6' },
  { id: 'card', label: 'Card', color: '#F26B21' },
];

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

// Midnight-to-midnight bounds for one calendar day in the server's local
// time zone — same helper as every other cashier-panel report's service.
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

// "EXP-YYMMDD-NNNN", sequential per tenant per calendar day — same
// count-of-existing-rows-for-this-prefix convention as CashWithdrawal's/
// CashDeposit's/CashTransfer's nextReferenceNo, numbered by the day the
// entry is actually logged (today), not by its (possibly backdated)
// expenseDate.
async function nextReferenceNo(tx, tenantId) {
  const prefix = `EXP-${refDateKey(new Date())}-`;
  const count = await tx.expense.count({ where: { tenantId, referenceNo: { startsWith: prefix } } });
  return `${prefix}${String(count + 1).padStart(4, '0')}`;
}

/** Turns a Prisma unique-constraint violation into a friendly 409 instead of a raw 500. */
function prismaKnownError(err) {
  if (err?.code === 'P2002') {
    return new ApiError(409, 'That expense reference number is already in use — try again', err.meta);
  }
  return err;
}

/**
 * Logs one expense entry. `actor` is req.user (the decoded JWT) —
 * outletId/cashierId/cashierName always come from there, never from the
 * request body, same rule every other create-flow in this app follows.
 * Unlike CashWithdrawal/CashDeposit/CashTransfer, this has no "must have
 * an open shift" guard — an expense (rent, a utility bill, a purchase) is
 * a general business record, not a movement of the shift's drawer cash,
 * so it can be logged with no shift open at all.
 *
 * `totalAmount` is always amount + tax, recomputed here — never trusted
 * from the client, same "never trust client math" rule the Total Amount
 * field on the create-form already mirrors client-side for instant
 * feedback.
 */
export async function createExpense(tenantId, outletId, data, actor) {
  return prisma.$transaction(async (tx) => {
    const amount = round2(data.amount);
    const tax = round2(data.tax || 0);
    const totalAmount = round2(amount + tax);
    const referenceNo = await nextReferenceNo(tx, tenantId);

    const expense = await tx.expense.create({
      data: {
        tenantId,
        outletId: outletId || null,
        referenceNo,
        expenseDate: new Date(`${data.expenseDate}T00:00:00`),
        category: data.category,
        description: data.description.trim(),
        amount,
        tax,
        totalAmount,
        paymentMode: data.paymentMode,
        paidToVendor: data.paidToVendor.trim(),
        remarks: data.remarks || null,
        costCenter: data.costCenter || null,
        accountHead: data.accountHead || null,
        project: data.project || null,
        attachmentName: data.attachmentName || null,
        cashierId: actor.id,
        cashierName: actor.name,
      },
    });

    return expense;
  }).catch((err) => { throw prismaKnownError(err); });
}

/**
 * Powers the Expenses Book page — the cashier's day-to-day expense log
 * reached from the main sidebar (not the Cashier Panel). Every figure is
 * read directly from real Expense rows created by createExpense above;
 * there's no separate reconciliation or shift concept here.
 *
 * - stats.totalExpenses/totalEntries/avgExpense are all-time totals for
 *   the outlet, independent of `date`.
 * - stats.todaysExpenses is always the server's current calendar day.
 * - stats.selectedDateExpenses/summary/byCategory/byPaymentMode/
 *   transactions are all scoped to `date` (defaults to today), keyed off
 *   each row's own expenseDate.
 * - summary.totalPaymentModes/totalCategories are the real count of
 *   distinct payment modes/categories actually used that day — not a
 *   fixed constant — so an outlet that only ever pays cash honestly shows
 *   1, not 4.
 * - byCategory/byPaymentMode always show every known category/tender
 *   (₹0.00 when unused that day) rather than omitting one, same "honest
 *   zero" convention as every other donut report here.
 */
export async function getExpenseReport(tenantId, outletId, params = {}) {
  const outletFilter = outletId ? { outletId } : {};
  const { start: dayStart, end: dayEnd } = dayBounds(params.date);
  const { start: todayStart, end: todayEnd } = dayBounds();
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;

  // 3 concurrent queries — well under the pool's real max of 5.
  const [allTimeAgg, todayAgg, dayExpensesDesc] = await Promise.all([
    prisma.expense.aggregate({
      where: { tenantId, ...outletFilter },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.expense.aggregate({
      where: { tenantId, ...outletFilter, expenseDate: { gte: todayStart, lte: todayEnd } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.expense.findMany({
      where: { tenantId, ...outletFilter, expenseDate: { gte: dayStart, lte: dayEnd } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalValue = round2(allTimeAgg._sum.totalAmount || 0);
  const totalCount = allTimeAgg._count;
  const avgExpense = totalCount > 0 ? round2(totalValue / totalCount) : 0;

  const totalOnDate = round2(dayExpensesDesc.reduce((sum, row) => sum + Number(row.totalAmount), 0));
  const distinctCategories = new Set(dayExpensesDesc.map((row) => row.category));
  const distinctPaymentModes = new Set(dayExpensesDesc.map((row) => row.paymentMode));

  const byCategoryAmount = {};
  const byPaymentModeAmount = {};
  dayExpensesDesc.forEach((row) => {
    const amt = Number(row.totalAmount);
    byCategoryAmount[row.category] = (byCategoryAmount[row.category] || 0) + amt;
    byPaymentModeAmount[row.paymentMode] = (byPaymentModeAmount[row.paymentMode] || 0) + amt;
  });

  const byCategory = CATEGORY_DEFS.map((def) => ({
    id: def.id, label: def.label, value: round2(byCategoryAmount[def.label] || 0), color: def.color,
  }));
  const byPaymentMode = PAYMENT_MODE_DEFS.map((def) => ({
    id: def.id, label: def.label, value: round2(byPaymentModeAmount[def.label] || 0), color: def.color,
  }));

  const cashExpenses = round2(byPaymentModeAmount.Cash || 0);
  const cardExpenses = round2(byPaymentModeAmount.Card || 0);
  const upiExpenses = round2(byPaymentModeAmount.UPI || 0);
  // "Other" is every tender that isn't Cash/Card/UPI — today that's only
  // Bank Transfer, but written generically so a future tender addition
  // doesn't silently drop out of this figure.
  const otherExpenses = round2(
    EXPENSE_PAYMENT_MODES.filter((m) => !['Cash', 'Card', 'UPI'].includes(m))
      .reduce((sum, mode) => sum + (byPaymentModeAmount[mode] || 0), 0),
  );

  const totalPages = Math.max(Math.ceil(dayExpensesDesc.length / pageSize), 1);
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageRows = dayExpensesDesc.slice(pageStart, pageStart + pageSize);

  return {
    stats: {
      totalExpenses: { value: totalValue, transactions: totalCount },
      totalEntries: { value: totalCount },
      avgExpense: { value: avgExpense },
      todaysExpenses: { value: round2(todayAgg._sum.totalAmount || 0), transactions: todayAgg._count },
      selectedDateExpenses: { value: totalOnDate, date: formatDayLabel(dayStart) },
    },
    selectedDate: formatDayLabel(dayStart),
    summary: {
      totalExpenses: totalOnDate,
      totalTransactions: dayExpensesDesc.length,
      totalPaymentModes: distinctPaymentModes.size,
      totalCategories: distinctCategories.size,
      cashExpenses,
      cardExpenses,
      upiExpenses,
      otherExpenses,
    },
    byCategory,
    byPaymentMode,
    transactions: pageRows.map((row) => ({
      dateTime: row.expenseDate,
      referenceNo: row.referenceNo,
      category: row.category,
      description: row.description,
      paymentMode: row.paymentMode,
      amount: round2(Number(row.totalAmount)),
      paidTo: row.paidToVendor,
      addedBy: row.cashierName,
      remarks: row.remarks || '',
    })),
    totalPages,
    page: safePage,
    pageSize,
  };
}
