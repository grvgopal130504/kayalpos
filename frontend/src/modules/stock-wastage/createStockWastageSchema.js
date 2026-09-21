import { z } from 'zod';
import { formatPickerDate } from '../../components/form/FormDatePicker';

// `outletLocation` options now come from the real Outlet API (see
// CreateStockWastagePage, which builds them from useGetOutletsQuery) — the
// old mock-data version hardcoded it as a fixed list of specific outlet
// names. Wastage Type/Department/Cost Center/Warehouse/UoM have no backing
// master table yet (there's no such model in the schema), so they stay
// fixed, same scope decision Stock Return/Stock Receipt make for their own
// analogous fixed dropdowns.

export const WASTAGE_TYPE_OPTIONS = [
  { value: '', label: 'Select Wastage Type', disabled: true },
  { value: 'Normal Wastage', label: 'Normal Wastage' },
  { value: 'Expiry Wastage', label: 'Expiry Wastage' },
  { value: 'Damage Wastage', label: 'Damage Wastage' },
  { value: 'Theft / Shrinkage', label: 'Theft / Shrinkage' },
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

export const WAREHOUSE_OPTIONS = [
  { value: '', label: 'Select Warehouse', disabled: true },
  { value: 'main-warehouse', label: 'Main Warehouse' },
  { value: 'store-front', label: 'Store Front' },
  { value: 'cold-storage', label: 'Cold Storage' },
];

export const UOM_OPTIONS = [
  { value: '', label: 'Select UoM', disabled: true },
  { value: 'nos', label: 'Nos' },
  { value: 'kg', label: 'Kg' },
  { value: 'ltr', label: 'Ltr' },
  { value: 'box', label: 'Box' },
];

// Dates are entered via FormDatePicker, which stores/parses the "DD Mon
// YYYY" format (e.g. "19 Sep 2026") — same convention Stock Return/Stock
// Receipt already use for their own date defaults (the old mock version's
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
    batchNo: '',
    expiryDate: '',
    availableQty: '0.00',
    wastageQty: '0.00',
    unitCost: '0.00',
    remarks: '',
  };
}

// A plain non-negative decimal amount, entered as free text — same
// convention as Stock Return/Stock Receipt's own decimalString() helper.
const decimalString = (message) => z.string().trim()
  .refine((v) => v === '' || (/^\d+(\.\d{1,3})?$/.test(v) && Number(v) >= 0), message);

const itemRowSchema = z.object({
  itemCode: z.string().trim(),
  itemName: z.string().trim(),
  hsnCode: z.string().trim(),
  uom: z.string().trim(),
  batchNo: z.string().trim(),
  expiryDate: z.string().trim(),
  availableQty: decimalString('Enter a valid available quantity'),
  wastageQty: decimalString('Enter a valid wastage quantity'),
  unitCost: decimalString('Enter a valid unit cost'),
  remarks: z.string().trim(),
});

// Every row with a non-blank Item Code is part of the document — same
// "filled row" convention Stock Return/Stock Receipt use.
export function isBlankItemRow(row) {
  return !row?.itemCode?.trim();
}

export const createStockWastageSchema = z
  .object({
    wastageDate: z.string().trim().min(1, 'Wastage date is required'),
    wastageType: z.string().trim().min(1, 'Select a wastage type'),
    department: z.string().trim().optional(),
    costCenter: z.string().trim().optional(),
    wastageReason: z.string().trim().min(1, 'Wastage reason is required'),
    wastageRemarks: z.string().trim().optional(),

    outletLocation: z.string().trim().min(1, 'Select an outlet / location'),
    warehouse: z.string().trim().min(1, 'Select a warehouse'),
    binRack: z.string().trim().optional(),

    referenceNo: z.string().trim().optional(),
    preparedBy: z.string().trim().optional(),
    approvedBy: z.string().trim().optional(),

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
      if (!row.wastageQty?.trim() || Number(row.wastageQty) <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'wastageQty'], message: 'Wastage qty must be greater than 0' });
      }
    });
    if (filledRows.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items'], message: 'Add at least one item' });
    }
  });

export const createStockWastageDefaultValues = {
  wastageDate: todayFormatted(),
  wastageType: 'Normal Wastage',
  department: '',
  costCenter: '',
  wastageReason: '',
  wastageRemarks: '',

  outletLocation: '',
  warehouse: '',
  binRack: '',

  referenceNo: '',
  preparedBy: '',
  approvedBy: '',

  notes: '',
  items: [emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow()],
};
