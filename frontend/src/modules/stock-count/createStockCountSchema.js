import { z } from 'zod';
import { formatPickerDate } from '../../components/form/FormDatePicker';

// Warehouse/Department/Cost Center/Count Reason/UoM have no backing master
// table in this schema (there's no such model) — they stay fixed, same
// scope decision Stock Wastage/Stock Return/Stock Receipt make for their
// own analogous fixed dropdowns.

export const WAREHOUSE_OPTIONS = [
  { value: '', label: 'Select Warehouse', disabled: true },
  { value: 'main-warehouse', label: 'Main Warehouse' },
  { value: 'store-front', label: 'Store Front' },
  { value: 'cold-storage', label: 'Cold Storage' },
];

export const DEPARTMENT_OPTIONS = [
  { value: '', label: 'Select Department / Section', disabled: true },
  { value: 'kitchen-bakery', label: 'Kitchen & Bakery' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'front-office', label: 'Front Office' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'store-inventory', label: 'Store & Inventory' },
];

export const COST_CENTER_OPTIONS = [
  { value: '', label: 'Select Cost Center', disabled: true },
  { value: 'kitchen-operations', label: 'Kitchen Operations' },
  { value: 'housekeeping-ops', label: 'Housekeeping Operations' },
  { value: 'admin-overheads', label: 'Admin Overheads' },
];

export const COUNT_REASON_OPTIONS = [
  { value: '', label: 'Select Count Reason', disabled: true },
  { value: 'periodic-audit', label: 'Periodic Audit' },
  { value: 'month-end-closing', label: 'Month End Closing' },
  { value: 'surprise-check', label: 'Surprise Check' },
  { value: 'discrepancy-investigation', label: 'Discrepancy Investigation' },
];

export const UOM_OPTIONS = [
  { value: '', label: 'Select UoM', disabled: true },
  { value: 'nos', label: 'Nos' },
  { value: 'kg', label: 'Kg' },
  { value: 'ltr', label: 'Ltr' },
  { value: 'box', label: 'Box' },
];

// Dates are entered via FormDatePicker, which stores/parses the "DD Mon
// YYYY" format (e.g. "19 Sep 2026") — same convention Stock Wastage/Stock
// Return already use for their own date defaults (the old mock version's
// hand-rolled DD/MM/YYYY format is replaced to match).
function todayFormatted() {
  return formatPickerDate(new Date());
}

export function emptyItemRow() {
  return {
    itemCode: '',
    itemName: '',
    hsnCode: '',
    uom: '',
    systemQty: '0.00',
    countedQty: '0.00',
    unitCost: '0.00',
    remarks: '',
  };
}

// A plain non-negative decimal amount, entered as free text — same
// convention as Stock Wastage/Stock Return's own decimalString() helper.
const decimalString = (message) => z.string().trim()
  .refine((v) => v === '' || (/^\d+(\.\d{1,3})?$/.test(v) && Number(v) >= 0), message);

const itemRowSchema = z.object({
  itemCode: z.string().trim(),
  itemName: z.string().trim(),
  hsnCode: z.string().trim(),
  uom: z.string().trim(),
  systemQty: decimalString('Enter a valid system quantity'),
  countedQty: decimalString('Enter a valid counted quantity'),
  unitCost: decimalString('Enter a valid unit cost'),
  remarks: z.string().trim(),
});

// Every row with a non-blank Item Code is part of the document — same
// "filled row" convention Stock Wastage/Stock Return use.
export function isBlankItemRow(row) {
  return !row?.itemCode?.trim();
}

export const createStockCountSchema = z
  .object({
    countDate: z.string().trim().min(1, 'Count date is required'),
    warehouse: z.string().trim().min(1, 'Select a warehouse'),
    department: z.string().trim().optional(),
    costCenter: z.string().trim().optional(),
    countReason: z.string().trim().min(1, 'Select a count reason'),
    countRemarks: z.string().trim().optional(),

    countType: z.string().trim().min(1, 'Select a count type'),
    countBy: z.string().trim().min(1, 'Select a count by option'),
    binRack: z.string().trim().optional(),
    startCountTime: z.string().trim().optional(),
    endCountTime: z.string().trim().optional(),

    referenceNo: z.string().trim().optional(),
    preparedBy: z.string().trim().optional(),
    approvedBy: z.string().trim().optional(),
    otherNotes: z.string().trim().optional(),

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
      if (row.countedQty?.trim() === '' || Number(row.countedQty) < 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'countedQty'], message: 'Counted qty is required' });
      }
    });
    if (filledRows.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items'], message: 'Add at least one item' });
    }
  });

export const createStockCountDefaultValues = {
  countDate: todayFormatted(),
  warehouse: '',
  department: '',
  costCenter: '',
  countReason: '',
  countRemarks: '',

  countType: 'complete',
  countBy: 'item-wise',
  binRack: '',
  startCountTime: '',
  endCountTime: '',

  referenceNo: '',
  preparedBy: '',
  approvedBy: '',
  otherNotes: '',

  notes: '',
  items: [emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow()],
};
