import { z } from 'zod';

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

export const OUTLET_OPTIONS = [
  { value: '', label: 'Select Outlet / Location', disabled: true },
  { value: 'rs-puram', label: 'RS Puram Outlet' },
  { value: 'anna-nagar', label: 'Anna Nagar Outlet' },
  { value: 'market-street', label: 'Market Street Outlet' },
  { value: 'main-warehouse', label: 'Main Warehouse' },
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
    batchNo: '',
    expiryDate: '',
    availableQty: '0.00',
    wastageQty: '0.00',
    unitCost: '0.00',
    remarks: '',
  };
}

const itemRowSchema = z.object({
  itemCode: z.string().trim(),
  itemName: z.string().trim(),
  hsnCode: z.string().trim(),
  uom: z.string().trim(),
  batchNo: z.string().trim(),
  expiryDate: z.string().trim(),
  availableQty: z.string().trim(),
  wastageQty: z.string().trim(),
  unitCost: z.string().trim(),
  remarks: z.string().trim(),
});

export const createStockWastageSchema = z.object({
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
