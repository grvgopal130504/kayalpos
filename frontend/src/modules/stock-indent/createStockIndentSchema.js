import { z } from 'zod';

export const DEPARTMENT_OPTIONS = [
  { value: '', label: 'Select Department / Section', disabled: true },
  { value: 'kitchen-bakery', label: 'Kitchen & Bakery' },
  { value: 'housekeeping', label: 'Housekeeping' },
  { value: 'front-office', label: 'Front Office' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'store-inventory', label: 'Store & Inventory' },
];

export const OUTLET_OPTIONS = [
  { value: '', label: 'Select From Outlet', disabled: true },
  { value: 'rs-puram', label: 'RS Puram Outlet' },
  { value: 'anna-nagar', label: 'Anna Nagar Outlet' },
  { value: 'market-street', label: 'Market Street Outlet' },
  { value: 'peelamedu', label: 'Peelamedu Outlet' },
];

export const TO_OUTLET_OPTIONS = [
  { value: '', label: 'Select To Outlet / HO', disabled: true },
  { value: 'main-warehouse', label: 'Main Warehouse' },
  { value: 'head-office', label: 'Head Office' },
  { value: 'cold-storage', label: 'Cold Storage' },
];

export const REQUESTOR_OPTIONS = [
  { value: '', label: 'Select Requestor', disabled: true },
  { value: 'ramesh-kumar', label: 'Ramesh Kumar' },
  { value: 'priya-enterprises', label: 'Priya Enterprises' },
  { value: 'suresh-babu', label: 'Suresh Babu' },
  { value: 'anand-retail', label: 'Anand Retail' },
];

export const PRIORITY_OPTIONS = [
  { value: '', label: 'Select Priority', disabled: true },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const LOCATION_OPTIONS = [
  { value: '', label: 'Select Location', disabled: true },
  { value: 'rs-puram', label: 'RS Puram Outlet' },
  { value: 'anna-nagar', label: 'Anna Nagar Outlet' },
  { value: 'market-street', label: 'Market Street Outlet' },
  { value: 'main-warehouse', label: 'Main Warehouse' },
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

// Rough per-unit cost lookup for a handful of demo items, used only to
// derive Total Estimated Value on the create screen since the item grid
// itself has no price column (matching the reference design).
export const ITEM_UNIT_VALUE = {
  'ITM-0001': 55,
  'ITM-0002': 42,
  'ITM-0003': 118,
  'ITM-0004': 125,
  'ITM-0005': 140,
};

function todayFormatted() {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function addDaysFormatted(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
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

const itemRowSchema = z.object({
  itemCode: z.string().trim(),
  itemName: z.string().trim(),
  hsnCode: z.string().trim(),
  uom: z.string().trim(),
  requiredQty: z.string().trim(),
  issueWarehouse: z.string().trim(),
  remarks: z.string().trim(),
});

export const createStockIndentSchema = z.object({
  indentDate: z.string().trim().min(1, 'Indent date is required'),
  requiredDate: z.string().trim().min(1, 'Required date is required'),
  department: z.string().trim().min(1, 'Select a department / section'),
  purposeRemarks: z.string().trim().optional(),
  fromOutlet: z.string().trim().min(1, 'Select a from outlet'),
  toOutlet: z.string().trim().min(1, 'Select a to outlet / HO'),
  requestor: z.string().trim().min(1, 'Select a requestor'),
  priority: z.string().trim().min(1, 'Select a priority'),
  designation: z.string().trim().optional(),
  referenceNo: z.string().trim().optional(),
  location: z.string().trim().min(1, 'Select a location'),
  costCenter: z.string().trim().optional(),
  remarks: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  items: z.array(itemRowSchema),
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
