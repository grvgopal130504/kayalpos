/**
 * Shared mappers between the real Customer API shape (status:
 * 'ACTIVE'/'INACTIVE', creditLimit/openingBalance: Decimal serialized as
 * string) and the shape CustomerTable / CustomerDetailsCard /
 * CustomerTransactionsCard / CustomerLoyaltySummary already expect.
 *
 * `totalPurchase`/`outstanding` are real, computed server-side from actual
 * Sale rows (see backend/src/modules/sale's getCustomerPurchaseSummaries /
 * getCustomerPurchaseSummary) — a customer with no sales yet honestly shows
 * 0 rather than a fabricated number, since `summary` is simply absent for
 * them. Recent transactions and the loyalty summary follow the same rule
 * (see toRecentTransactions/toLoyaltySummary below): everything shown is
 * either a real Sale row or a real Customer column, never invented.
 */

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(value) {
  if (!value) return '';
  const d = new Date(value);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
}

export function toCustomerRow(row, summary) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    mobile: row.mobile,
    email: row.email || '',
    loyaltyPoints: row.loyaltyPoints || 0,
    totalPurchase: summary?.totalPurchase || 0,
    outstanding: summary?.outstanding || 0,
    status: row.status === 'ACTIVE' ? 'active' : 'inactive',
  };
}

export function toCustomerDetails(row, summary) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    initials: row.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase(),
    status: row.status === 'ACTIVE' ? 'active' : 'inactive',
    mobile: row.mobile,
    email: row.email || '',
    address: row.address || '',
    dateOfJoining: new Date(row.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    loyaltyPoints: row.loyaltyPoints || 0,
    totalPurchase: summary?.totalPurchase || 0,
    outstandingAmount: summary?.outstanding || 0,
  };
}

/** Builds CustomerTransactionsCard's row shape from a real /sales/customer/:id
 * response's `recentTransactions` (each a real Sale, billed to this
 * customer) — [] when the customer has no sales yet, which renders the
 * card's own "No transactions found" empty state instead of fake rows. */
export function toRecentTransactions(customerSales) {
  if (!customerSales?.recentTransactions) return [];
  return customerSales.recentTransactions.map((t) => ({
    date: formatDate(t.date),
    type: t.type,
    invoiceNo: t.invoiceNo,
    amount: t.amount,
    payment: t.payment,
    status: t.status,
  }));
}

/** Builds CustomerLoyaltySummary's tile shape honestly: `availablePoints`
 * and `totalEarnedPoints` both read the customer's real (and only) points
 * balance — nothing has ever redeemed points in this app yet, so the
 * current balance IS the total ever earned, and `totalRedeemedPoints` is
 * genuinely 0 rather than guessed. `transactions` is the customer's real
 * Sale count (from the same /sales/customer/:id response) — a true count of
 * their billed visits, not a fabricated loyalty-ledger figure. */
export function toLoyaltySummary(row, customerSales) {
  const points = row?.loyaltyPoints || 0;
  return {
    availablePoints: points,
    totalEarnedPoints: points,
    totalRedeemedPoints: 0,
    transactions: customerSales?.transactionCount || 0,
  };
}
