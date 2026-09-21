import { z } from 'zod';
import { formatPickerDate } from '../../components/form/FormDatePicker';

// `fromOutlet`/`toOutlet` options now come from the real Outlet API (see
// CreateStockTransferPage, which builds them from useGetOutletsQuery) — the
// old mock-data version hardcoded both as fixed lists of specific outlet
// names. `stockIndentRef` options now come from the real Stock Indent API,
// filtered to indents with a real status of 'approved' — the old mock
// version filtered a fixed local INDENTS array the same way, so this list
// will honestly stay empty until a real approval-workflow action exists
// (see backend/src/modules/stock-indent's model comment). The remaining
// lists below have no backing master table yet (there's no Department/
// Cost-Center model in the schema), so they stay fixed, same scope decision
// every other module makes for its own non-modeled dropdowns.

export const DEPARTMENT_OPTIONS = [
  { value: '', label: 'Select Department / Section', disabled: true },
  { value: 'kitchen-bakery', label: 'Kitchen & Bakery' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'front-office', label: 'Front Office' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'store-inventory', label: 'Store & Inventory' },
];

export const PRIORITY_OPTIONS = [
  { value: '', label: 'Select Priority', disabled: true },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const COST_CENTER_OPTIONS = [
  { value: '', label: 'Select Cost Center', disabled: true },
  { value: 'kitchen-operations', label: 'Kitchen Operations' },
  { value: 'housekeeping-ops', label: 'Housekeeping Operations' },
  { value: 'admin-overheads', label: 'Admin Overheads' },
];

export const UOM_OPTIONS = [
  { value: '', label: 'Select UoM', disabled: true },
  { value: 'nos', label: 'Nos' },
  { value: 'kg', label: 'Kg' },
  { value: 'ltr', label: 'Ltr' },
  { value: 'box', label: 'Box' },
];

// Both dates are entered via FormDatePicker, which stores/parses the
// "DD Mon YYYY" format (e.g. "19 Sep 2026") — same convention Stock
// Indent/Sales Order/Sales Invoice/Barcode & Label already use for their
// own date defaults.
function todayFormatted() {
  return formatPickerDate(new Date());
}

export function emptyItemRow() {
  return {
    itemCode: '',
    itemName: '',
    hsnCode: '',
    uom: '',
    transferQty: '',
    remarks: '',
  };
}

// A plain non-negative decimal amount, entered as free text — same
// convention as the sales-cycle modules' own decimalString() helper.
const decimalString = (message) => z.string().trim()
  .refine((v) => v === '' || (/^\d+(\.\d{1,3})?$/.test(v) && Number(v) >= 0), message);

const itemRowSchema = z.object({
  itemCode: z.string().trim(),
  itemName: z.string().trim(),
  hsnCode: z.string().trim(),
  uom: z.string().trim(),
  transferQty: decimalString('Enter a valid transfer quantity'),
  remarks: z.string().trim(),
});

// Every row with a non-blank Item Code is part of the document — same
// "filled row" convention Stock Indent/Sales Quotation/Order/Invoice use.
export function isBlankItemRow(row) {
  return !row?.itemCode?.trim();
}

export const createStockTransferSchema = z
  .object({
    transferDate: z.string().trim().min(1, 'Transfer date is required'),
    stockIndentRef: z.string().trim().optional(),
    fromOutlet: z.string().trim().min(1, 'Select a from outlet'),
    toOutlet: z.string().trim().min(1, 'Select a to outlet'),
    department: z.string().trim().optional(),
    purposeRemarks: z.string().trim().optional(),
    priority: z.string().trim().optional(),
    referenceNo: z.string().trim().optional(),
    costCenter: z.string().trim().optional(),
    remarks: z.string().trim().optional(),
    notes: z.string().trim().optional(),
    items: z.array(itemRowSchema),
  })
  .superRefine((values, ctx) => {
    const filledRows = values.items.filter((row) => !isBlankItemRow(row));
    values.items.forEach((row, index) => {
      if (isBlankItemRow(row)) return;
      if (!row.itemName?.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'itemName'], message: 'Item name is required' });
      }
      if (!row.transferQty?.trim() || Number(row.transferQty) <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'transferQty'], message: 'Transfer qty must be greater than 0' });
      }
    });
    if (filledRows.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items'], message: 'Add at least one item' });
    }
  });

export const createStockTransferDefaultValues = {
  transferDate: todayFormatted(),
  stockIndentRef: '',
  fromOutlet: '',
  toOutlet: '',
  department: '',
  purposeRemarks: '',
  priority: '',
  referenceNo: '',
  costCenter: '',
  remarks: '',
  notes: '',
  items: [emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow()],
};
