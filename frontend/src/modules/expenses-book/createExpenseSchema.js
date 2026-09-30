import { z } from 'zod';

import { formatPickerDate, parsePickerDate } from '../../components/form/FormDatePicker';

export const CATEGORY_OPTIONS = [
  { value: '', label: 'Select Category', disabled: true },
  { value: 'Purchase / Stock', label: 'Purchase / Stock' },
  { value: 'Rent', label: 'Rent' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Salaries', label: 'Salaries' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Repair & Maintenance', label: 'Repair & Maintenance' },
  { value: 'Office Expenses', label: 'Office Expenses' },
];

export const PAYMENT_MODE_OPTIONS = [
  { value: '', label: 'Select Payment Mode', disabled: true },
  { value: 'Cash', label: 'Cash' },
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'UPI', label: 'UPI' },
  { value: 'Card', label: 'Card' },
];

export const COST_CENTER_OPTIONS = [
  { value: '', label: 'Select Cost Center', disabled: true },
  { value: 'kitchen-operations', label: 'Kitchen Operations' },
  { value: 'housekeeping-ops', label: 'Housekeeping Operations' },
  { value: 'admin-overheads', label: 'Admin Overheads' },
];

export const ACCOUNT_HEAD_OPTIONS = [
  { value: '', label: 'Select Account Head', disabled: true },
  { value: 'direct-expenses', label: 'Direct Expenses' },
  { value: 'indirect-expenses', label: 'Indirect Expenses' },
  { value: 'capital-expenditure', label: 'Capital Expenditure' },
];

export const PROJECT_OPTIONS = [
  { value: '', label: 'Select Project', disabled: true },
  { value: 'store-renovation', label: 'Store Renovation' },
  { value: 'new-outlet-setup', label: 'New Outlet Setup' },
  { value: 'general', label: 'General' },
];

const CATEGORY_VALUES = CATEGORY_OPTIONS.filter((o) => o.value).map((o) => o.value);
const PAYMENT_MODE_VALUES = PAYMENT_MODE_OPTIONS.filter((o) => o.value).map((o) => o.value);

function toNumber(value) {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : NaN;
}

// Client-side validation mirrors the server's createExpenseSchema
// (backend/src/modules/expense/expense.schema.js) — amount must be a real
// positive number, tax can't be negative, category/paymentMode must be one
// of the real options — so a bad entry is caught before the request ever
// leaves the browser, not just on the server's 400 response.
export const createExpenseSchema = z.object({
  expenseDate: z.string().trim().min(1, 'Expense date is required')
    .refine((v) => Boolean(parsePickerDate(v)), 'Enter a valid date'),
  category: z.string().trim().refine((v) => CATEGORY_VALUES.includes(v), 'Select a category'),
  description: z.string().trim().min(1, 'Description is required').max(500, 'Description cannot exceed 500 characters'),
  amount: z.string().trim().min(1, 'Amount is required')
    .refine((v) => toNumber(v) > 0, 'Amount must be greater than zero'),
  tax: z.string().trim().optional()
    .refine((v) => !v || toNumber(v) >= 0, 'Tax cannot be negative'),
  paymentMode: z.string().trim().refine((v) => PAYMENT_MODE_VALUES.includes(v), 'Select a payment mode'),
  paidToVendor: z.string().trim().min(1, 'Paid To / Vendor is required').max(150, 'Paid To / Vendor cannot exceed 150 characters'),
  remarks: z.string().trim().max(500, 'Remarks cannot exceed 500 characters').optional(),

  costCenter: z.string().trim().optional(),
  accountHead: z.string().trim().optional(),
  project: z.string().trim().optional(),
});

export const createExpenseDefaultValues = {
  // "DD Mon YYYY" — the format FormDatePicker actually reads/writes (see
  // formatPickerDate/parsePickerDate), not the "DD/MM/YYYY" this default
  // used to carry, which FormDatePicker's own parser couldn't read back.
  expenseDate: formatPickerDate(new Date()),
  category: '',
  description: '',
  amount: '0.00',
  tax: '0.00',
  paymentMode: '',
  paidToVendor: '',
  remarks: '',

  costCenter: '',
  accountHead: '',
  project: '',
};

// yyyy-mm-dd in the *local* time zone — what the backend's `expenseDate`
// field expects (see CashSalesPage.jsx's toDateKey for the same
// local-vs-UTC reasoning).
function toDateKey(pickerValue) {
  const date = parsePickerDate(pickerValue) || new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Converts the form's string-typed values into the real POST /expenses
// body — numeric strings become numbers, blank optional fields become
// undefined rather than empty strings, and the date is reshaped for the
// server. Mirrors shiftClosingSchema.js's shiftClosingFormValuesToPayload
// convention: form values stay strings for react-hook-form's sake, the
// payload converts them once, right before the request.
export function expenseFormValuesToPayload(values) {
  return {
    expenseDate: toDateKey(values.expenseDate),
    category: values.category,
    description: values.description.trim(),
    amount: toNumber(values.amount),
    tax: values.tax ? toNumber(values.tax) : 0,
    paymentMode: values.paymentMode,
    paidToVendor: values.paidToVendor.trim(),
    remarks: values.remarks?.trim() || undefined,
    costCenter: values.costCenter || undefined,
    accountHead: values.accountHead || undefined,
    project: values.project || undefined,
  };
}
