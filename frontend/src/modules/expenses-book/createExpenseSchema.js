import { z } from 'zod';

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

function todayFormatted() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

export const createExpenseSchema = z.object({
  expenseDate: z.string().trim().min(1, 'Expense date is required'),
  category: z.string().trim().min(1, 'Select a category'),
  description: z.string().trim().min(1, 'Description is required'),
  amount: z.string().trim().min(1, 'Amount is required'),
  tax: z.string().trim().optional(),
  paymentMode: z.string().trim().min(1, 'Select a payment mode'),
  paidToVendor: z.string().trim().min(1, 'Paid To / Vendor is required'),
  remarks: z.string().trim().optional(),

  costCenter: z.string().trim().optional(),
  accountHead: z.string().trim().optional(),
  project: z.string().trim().optional(),
});

export const createExpenseDefaultValues = {
  expenseDate: todayFormatted(),
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
