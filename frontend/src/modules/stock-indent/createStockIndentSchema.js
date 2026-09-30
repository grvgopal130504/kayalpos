import { z } from 'zod';
import { formatPickerDate } from '../../components/form/FormDatePicker';

// `fromOutlet`/`toOutlet`/`location` options now come from the real Outlet
// API (see CreateStockIndentPage, which builds them from
// useGetOutletsQuery) — the old mock-data version hardcoded all three as
// fixed lists of specific outlet names. `requestor` is no longer a fixed
// dropdown of specific fake named individuals/entities either — there is no
// Employee/Requestor master in this schema, so presenting a fixed list of
// invented people as selectable real data would be fabricated data; it's a
// plain required free-text field instead (see CreateStockIndentPage's
// FormTextField for it). The remaining lists below have no backing master
// table yet (there's no Department/Cost-Center/Warehouse model in the
// schema), so they stay fixed, same scope decision every other module makes
// for its own non-modeled dropdowns (e.g. Sales Invoice's
// PAYMENT_TERMS_OPTIONS).

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

export const WAREHOUSE_OPTIONS = [
  { value: '', label: 'Select Warehouse', disabled: true },
  { value: 'main-warehouse', label: 'Main Warehouse' },
  { value: 'store-front', label: 'Store Front' },
  { value: 'cold-storage', label: 'Cold Storage' },
];

// Both dates are entered via FormDatePicker, which stores/parses the
// "DD Mon YYYY" format (e.g. "19 Sep 2026") — using formatPickerDate here
// (instead of the old mock's own DD/MM/YYYY helpers) keeps the default
// value in the exact format the picker round-trips, same convention Sales
// Order/Sales Invoice/Barcode & Label already use for their own date
// defaults.
function todayFormatted() {
  return formatPickerDate(new Date());
}

function addDaysFormatted(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return formatPickerDate(d);
}

export function emptyItemRow() {
  return {
    itemCode: '',
    itemName: '',
    hsnCode: '',
    uom: '',
    requiredQty: '1.00',
    issueWarehouse: '',
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
  requiredQty: decimalString('Enter a valid required quantity'),
  issueWarehouse: z.string().trim(),
  remarks: z.string().trim(),
});

// Every row with a non-blank Item Code is part of the document — same
// "filled row" convention Sales Quotation/Order/Invoice use, unlike Barcode
// & Label's selected-only rows (there's no per-row checkbox here).
export function isBlankItemRow(row) {
  return !row?.itemCode?.trim();
}

export const createStockIndentSchema = z
  .object({
    indentDate: z.string().trim().min(1, 'Indent date is required'),
    requiredDate: z.string().trim().min(1, 'Required date is required'),
    department: z.string().trim().min(1, 'Select a department / section'),
    purposeRemarks: z.string().trim().optional(),
    fromOutlet: z.string().trim().min(1, 'Select a from outlet'),
    toOutlet: z.string().trim().min(1, 'Select a to outlet'),
    requestor: z.string().trim().min(1, 'Requestor is required'),
    priority: z.string().trim().min(1, 'Select a priority'),
    designation: z.string().trim().optional(),
    referenceNo: z.string().trim().optional(),
    location: z.string().trim().optional(),
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
      if (!row.requiredQty?.trim() || Number(row.requiredQty) <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'requiredQty'], message: 'Required qty must be greater than 0' });
      }
    });
    if (filledRows.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items'], message: 'Add at least one item' });
    }
  });

export const createStockIndentDefaultValues = {
  indentDate: todayFormatted(),
  requiredDate: addDaysFormatted(3),
  department: '',
  purposeRemarks: '',
  fromOutlet: '',
  toOutlet: '',
  requestor: '',
  priority: '',
  designation: '',
  referenceNo: '',
  location: '',
  costCenter: '',
  remarks: '',
  notes: '',
  items: [emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow()],
};
