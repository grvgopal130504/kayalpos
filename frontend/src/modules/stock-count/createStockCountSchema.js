import { z } from 'zod';

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
    systemQty: '0.00',
    countedQty: '0.00',
    unitCost: '0.00',
    remarks: '',
  };
}

const itemRowSchema = z.object({
  itemCode: z.string().trim(),
  itemName: z.string().trim(),
  hsnCode: z.string().trim(),
  uom: z.string().trim(),
  systemQty: z.string().trim(),
  countedQty: z.string().trim(),
  unitCost: z.string().trim(),
  remarks: z.string().trim(),
});

export const createStockCountSchema = z.object({
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
