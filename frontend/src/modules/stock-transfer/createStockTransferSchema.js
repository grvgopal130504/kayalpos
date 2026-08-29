import { z } from 'zod';
import { INDENTS } from '../stock-indent/stockIndentMockData';

export const STOCK_INDENT_OPTIONS = [
  { value: '', label: 'Select Stock Indent' },
  ...INDENTS.filter((ind) => ind.status === 'approved').map((ind) => ({ value: ind.code, label: ind.code })),
];

export const OUTLET_OPTIONS = [
  { value: '', label: 'Select From Outlet', disabled: true },
  { value: 'rs-puram', label: 'RS Puram Outlet' },
  { value: 'anna-nagar', label: 'Anna Nagar Outlet' },
  { value: 'market-street', label: 'Market Street Outlet' },
  { value: 'main-warehouse', label: 'Main Warehouse' },
];

export const TO_OUTLET_OPTIONS = [
  { value: '', label: 'Select To Outlet / HO', disabled: true },
  { value: 'main-warehouse', label: 'Main Warehouse' },
  { value: 'head-office', label: 'Head Office' },
  { value: 'rs-puram', label: 'RS Puram Outlet' },
  { value: 'anna-nagar', label: 'Anna Nagar Outlet' },
];

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

// Rough per-unit lookups for a handful of demo items, used to populate the
// read-only Available Qty / Unit Cost columns once an item code is
// entered, matching the reference design's grayed lookup cells.
export const ITEM_AVAILABLE_QTY = {
  'ITM-0001': 12, 'ITM-0002': 25, 'ITM-0003': 15, 'ITM-0004': 30, 'ITM-0005': 18,
};
export const ITEM_UNIT_COST = {
  'ITM-0001': 55, 'ITM-0002': 42, 'ITM-0003': 118, 'ITM-0004': 125, 'ITM-0005': 140,
};

function todayFormatted() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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

const itemRowSchema = z.object({
  itemCode: z.string().trim(),
  itemName: z.string().trim(),
  hsnCode: z.string().trim(),
  uom: z.string().trim(),
  transferQty: z.string().trim(),
  remarks: z.string().trim(),
});

export const createStockTransferSchema = z.object({
  transferDate: z.string().trim().min(1, 'Transfer date is required'),
  stockIndentRef: z.string().trim().optional(),
  fromOutlet: z.string().trim().min(1, 'Select a from outlet'),
  toOutlet: z.string().trim().min(1, 'Select a to outlet / HO'),
  department: z.string().trim().optional(),
  purposeRemarks: z.string().trim().optional(),
  priority: z.string().trim().optional(),
  referenceNo: z.string().trim().optional(),
  costCenter: z.string().trim().optional(),
  remarks: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  items: z.array(itemRowSchema),
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
