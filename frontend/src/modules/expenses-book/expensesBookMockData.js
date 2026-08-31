/**
 * TEMPORARY mock data for the Expenses Book module. There's no Expenses
 * Book backend module yet, so this static snapshot stands in for
 * `useGetExpensesBookQuery()`. Replace with real API data once that
 * module exists — do not add more mock data here in the meantime.
 */

export const CASHIER = { name: 'Karthik', code: 'C001' };

export const EXPENSES_BOOK = {
  stats: {
    totalExpenses: { value: 24750.00, transactions: 18 },
    totalEntries: { value: 18 },
    avgExpense: { value: 1375.00 },
    todaysExpenses: { value: 4250.00, transactions: 3 },
    selectedDateExpenses: { value: 24750.00, date: '26/05/2026' },
  },
  selectedDate: '26/05/2026',
  summary: {
    totalExpenses: 24750.00,
    totalTransactions: 18,
    totalPaymentModes: 4,
    totalCategories: 7,
    cashExpenses: 12750.00,
    cardExpenses: 7500.00,
    upiExpenses: 3750.00,
    otherExpenses: 750.00,
  },
  byCategory: [
    { id: 'purchase-stock', label: 'Purchase / Stock', value: 8250.00, color: '#2563EB' },
    { id: 'rent', label: 'Rent', value: 5000.00, color: '#22A06B' },
    { id: 'utilities', label: 'Utilities', value: 3750.00, color: '#F26B21' },
    { id: 'salaries', label: 'Salaries', value: 3000.00, color: '#8B5CF6' },
    { id: 'transport', label: 'Transport', value: 2250.00, color: '#0EA5A4' },
    { id: 'repair-maintenance', label: 'Repair & Maintenance', value: 1500.00, color: '#EC4899' },
    { id: 'office-expenses', label: 'Office Expenses', value: 1000.00, color: '#F5A623' },
  ],
  byPaymentMode: [
    { id: 'cash', label: 'Cash', value: 12750.00, color: '#22A06B' },
    { id: 'bank-transfer', label: 'Bank Transfer', value: 7500.00, color: '#2563EB' },
    { id: 'upi', label: 'UPI', value: 3750.00, color: '#8B5CF6' },
    { id: 'card', label: 'Card', value: 750.00, color: '#F26B21' },
  ],
  totalPages: 1,
  transactions: [
    { dateTime: '26/05/2026 09:20 AM', referenceNo: 'EXP-260526-0018', category: 'Purchase / Stock', description: 'Vegetable purchase', paymentMode: 'Cash', amount: 2850.00, paidTo: 'Suresh Traders', addedBy: 'Karthik (C001)', remarks: 'Fresh stock purchase' },
    { dateTime: '26/05/2026 08:45 AM', referenceNo: 'EXP-260526-0017', category: 'Rent', description: 'Shop rent - May 2026', paymentMode: 'Bank Transfer', amount: 5000.00, paidTo: 'Building Owner', addedBy: 'Karthik (C001)', remarks: 'Monthly rent' },
    { dateTime: '26/05/2026 08:15 AM', referenceNo: 'EXP-260526-0016', category: 'Utilities', description: 'Electricity bill', paymentMode: 'UPI', amount: 1850.00, paidTo: 'TNEB', addedBy: 'Karthik (C001)', remarks: 'April - May 2026' },
    { dateTime: '26/05/2026 07:55 AM', referenceNo: 'EXP-260526-0015', category: 'Salaries', description: 'Staff salary payment', paymentMode: 'Cash', amount: 2500.00, paidTo: 'Staff', addedBy: 'Karthik (C001)', remarks: 'Daily wages' },
    { dateTime: '26/05/2026 07:35 AM', referenceNo: 'EXP-260526-0014', category: 'Transport', description: 'Transport charges', paymentMode: 'Cash', amount: 800.00, paidTo: 'Ramesh Transport', addedBy: 'Karthik (C001)', remarks: 'Stock transport' },
    { dateTime: '26/05/2026 07:10 AM', referenceNo: 'EXP-260526-0013', category: 'Repair & Maintenance', description: 'AC repair', paymentMode: 'Card', amount: 1200.00, paidTo: 'Cool Care Services', addedBy: 'Karthik (C001)', remarks: 'AC servicing' },
    { dateTime: '26/05/2026 06:50 AM', referenceNo: 'EXP-260526-0012', category: 'Office Expenses', description: 'Stationery items', paymentMode: 'UPI', amount: 650.00, paidTo: 'Office Mart', addedBy: 'Karthik (C001)', remarks: 'Pens, files, papers' },
    { dateTime: '26/05/2026 06:30 AM', referenceNo: 'EXP-260526-0011', category: 'Utilities', description: 'Water bill', paymentMode: 'UPI', amount: 450.00, paidTo: 'Municipality', addedBy: 'Karthik (C001)', remarks: 'May 2026' },
  ],
};
