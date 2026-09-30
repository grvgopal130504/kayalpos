import { z } from 'zod';

// Same 7 categories the create-form's CATEGORY_OPTIONS offers — kept in
// sync with expensesBookMockData.js's byCategory donut labels/colors (see
// expense.service.js's CATEGORY_DEFS) so every category a row can have is
// always one this report already has a donut slice/color for.
export const EXPENSE_CATEGORIES = [
  'Purchase / Stock', 'Rent', 'Utilities', 'Salaries', 'Transport', 'Repair & Maintenance', 'Office Expenses',
];

// Same 4 tenders the create-form's PAYMENT_MODE_OPTIONS offers.
export const EXPENSE_PAYMENT_MODES = ['Cash', 'Bank Transfer', 'UPI', 'Card'];

// Query params for the Expenses Book report (GET /expenses/summary). `date`
// scopes the Expense Summary/donuts/transactions list to one calendar day
// (defaults to today when omitted), keyed off each Expense's own
// `expenseDate` — NOT createdAt, since an expense can be logged for a past
// date. The "Total Expenses"/"Total Entries"/"Average Expense" stat tiles
// are always all-time for the outlet, same convention as every other
// cashier-panel report's query schema.
export const expenseQuerySchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.coerce.number().int('Page must be a whole number').positive('Page must be at least 1').default(1),
  pageSize: z.coerce.number().int('Page size must be a whole number').positive('Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100').default(10),
});

// Logs one expense entry — see expense.service.js's createExpense for what
// gets recomputed server-side (totalAmount, referenceNo) rather than
// trusted from the body.
export const createExpenseSchema = z.object({
  expenseDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expense date must be in YYYY-MM-DD format'),
  category: z.enum(EXPENSE_CATEGORIES, { errorMap: () => ({ message: 'Select a category' }) }),
  description: z.string().trim().min(1, 'Description is required').max(500, 'Description cannot exceed 500 characters'),
  amount: z.coerce.number().positive('Amount must be greater than zero'),
  tax: z.coerce.number().nonnegative('Tax cannot be negative').default(0),
  paymentMode: z.enum(EXPENSE_PAYMENT_MODES, { errorMap: () => ({ message: 'Select a payment mode' }) }),
  paidToVendor: z.string().trim().min(1, 'Paid To / Vendor is required').max(150, 'Paid To / Vendor cannot exceed 150 characters'),
  remarks: z.string().trim().max(500, 'Remarks cannot exceed 500 characters').optional().or(z.literal('')),
  costCenter: z.string().trim().max(150).optional().or(z.literal('')),
  accountHead: z.string().trim().max(150).optional().or(z.literal('')),
  project: z.string().trim().max(150).optional().or(z.literal('')),
  // Just the uploaded file's name — see the Expense model's own comment for
  // why there's no real file storage backing this yet.
  attachmentName: z.string().trim().max(255).optional().or(z.literal('')),
});
