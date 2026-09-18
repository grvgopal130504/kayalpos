/**
 * Shared mappers between the real Customer API shape (status:
 * 'ACTIVE'/'INACTIVE', creditLimit/openingBalance: Decimal serialized as
 * string) and the shape CustomerTable / CustomerDetailsCard /
 * CustomerTransactionsCard / CustomerLoyaltySummary already expect.
 *
 * `totalPurchase`, `outstanding`/`outstandingAmount`, recent transactions,
 * and the loyalty summary are NOT real yet — they depend on the Sales
 * Invoice + Payment and Loyalty modules, which don't exist. They show as 0 /
 * empty here rather than fabricated numbers, per the "no fake data to hide
 * broken functionality" rule; the UI sections that show them are clearly
 * incomplete until those modules are built.
 */

export function toCustomerRow(row) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    mobile: row.mobile,
    email: row.email || '',
    loyaltyPoints: row.loyaltyPoints || 0,
    totalPurchase: 0,
    outstanding: 0,
    status: row.status === 'ACTIVE' ? 'active' : 'inactive',
  };
}

export function toCustomerDetails(row) {
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
    totalPurchase: 0,
    outstandingAmount: 0,
  };
}
