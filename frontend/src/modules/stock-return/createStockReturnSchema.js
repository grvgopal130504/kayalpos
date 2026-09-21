import { z } from 'zod';
import { formatPickerDate } from '../../components/form/FormDatePicker';

// `supplier`/`fromOutlet` options now come from the real Supplier/Outlet
// APIs (see CreateStockReturnPage, which builds them from
// useGetSuppliersQuery/useGetOutletsQuery) — the old mock-data version
// hardcoded both as fixed lists of specific supplier/outlet names. Return
// Type/Reference Type/Cost Center/UoM/Warehouse have no backing master
// table yet (there's no such model in the schema), so they stay fixed, same
// scope decision Stock Receipt makes for its own Purchase Type/Cost Center/
// UoM/Warehouse. Reference No. used to be a fixed dropdown of fabricated
// invoice numbers (PINV-00021, ...) — there is no real Purchase Invoice/GRN
// master to select from, so it's now plain free text, matching how Stock
// Receipt's own analogous "Reference (if any)" field is handled.

export const RETURN_TYPE_OPTIONS = [
  { value: '', label: 'Select Return Type', disabled: true },
  { value: 'Purchase Return', label: 'Purchase Return' },
  { value: 'Stock Damage Return', label: 'Stock Damage Return' },
  { value: 'Excess Stock Return', label: 'Excess Stock Return' },
  { value: 'Expired Stock Return', label: 'Expired Stock Return' },
];

export const REFERENCE_TYPE_OPTIONS = [
  { value: '', label: 'Select Reference Type', disabled: true },
  { value: 'Purchase Invoice', label: 'Purchase Invoice' },
  { value: 'Stock Receipt', label: 'Stock Receipt' },
  { value: 'GRN', label: 'GRN' },
  { value: 'None', label: 'None' },
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

// Dates are entered via FormDatePicker, which stores/parses the "DD Mon
// YYYY" format (e.g. "19 Sep 2026") — same convention Stock Receipt/Stock
// Indent/Stock Transfer already use for their own date defaults.
function todayFormatted() {
  return formatPickerDate(new Date());
}

export function emptyItemRow() {
  return {
    itemCode: '',
    itemName: '',
    hsnCode: '',
    uom: '',
    returnedQty: '',
    unitCost: '0.00',
    discount: '0.00',
    tax: '0.00',
    warehouse: '',
    batchNo: '',
    expiryDate: '',
    remarks: '',
  };
}

// A plain non-negative decimal amount, entered as free text — same
// convention as Stock Receipt's own decimalString() helper.
const decimalString = (message) => z.string().trim()
  .refine((v) => v === '' || (/^\d+(\.\d{1,3})?$/.test(v) && Number(v) >= 0), message);

const itemRowSchema = z.object({
  itemCode: z.string().trim(),
  itemName: z.string().trim(),
  hsnCode: z.string().trim(),
  uom: z.string().trim(),
  returnedQty: decimalString('Enter a valid returned quantity'),
  unitCost: decimalString('Enter a valid unit cost'),
  discount: decimalString('Enter a valid discount'),
  tax: decimalString('Enter a valid tax'),
  warehouse: z.string().trim(),
  batchNo: z.string().trim(),
  expiryDate: z.string().trim(),
  remarks: z.string().trim(),
});

// Every row with a non-blank Item Code is part of the document — same
// "filled row" convention Stock Receipt/Stock Indent/Stock Transfer use.
export function isBlankItemRow(row) {
  return !row?.itemCode?.trim();
}

export const createStockReturnSchema = z
  .object({
    returnDate: z.string().trim().min(1, 'Return date is required'),
    returnType: z.string().trim().min(1, 'Select a return type'),
    referenceType: z.string().trim().min(1, 'Select a reference type'),
    referenceNo: z.string().trim().optional(),
    referenceDate: z.string().trim().optional(),
    returnReason: z.string().trim().optional(),
    returnRemarks: z.string().trim().optional(),

    supplier: z.string().trim().min(1, 'Select a supplier'),
    fromOutlet: z.string().trim().min(1, 'Select a from outlet / HO'),
    costCenter: z.string().trim().optional(),
    contactPerson: z.string().trim().optional(),
    mobileNo: z.string().trim().optional(),

    grnDcNo: z.string().trim().optional(),
    grnDcDate: z.string().trim().optional(),
    vehicleNo: z.string().trim().optional(),
    transporter: z.string().trim().optional(),
    otherRemarks: z.string().trim().optional(),

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
      if (!row.returnedQty?.trim() || Number(row.returnedQty) <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items', index, 'returnedQty'], message: 'Returned qty must be greater than 0' });
      }
    });
    if (filledRows.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['items'], message: 'Add at least one item' });
    }
  });

export const createStockReturnDefaultValues = {
  returnDate: todayFormatted(),
  returnType: 'Purchase Return',
  referenceType: 'Purchase Invoice',
  referenceNo: '',
  referenceDate: '',
  returnReason: '',
  returnRemarks: '',

  supplier: '',
  fromOutlet: '',
  costCenter: '',
  contactPerson: '',
  mobileNo: '',

  grnDcNo: '',
  grnDcDate: '',
  vehicleNo: '',
  transporter: '',
  otherRemarks: '',

  notes: '',
  items: [emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow(), emptyItemRow()],
};
