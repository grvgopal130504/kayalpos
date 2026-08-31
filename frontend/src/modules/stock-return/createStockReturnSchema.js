import { z } from 'zod';

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

export const REFERENCE_NO_OPTIONS = [
  { value: '', label: 'Select Purchase Invoice', disabled: true },
  { value: 'PINV-00021', label: 'PINV-00021' },
  { value: 'PINV-00020', label: 'PINV-00020' },
  { value: 'PINV-00019', label: 'PINV-00019' },
];

export const SUPPLIER_OPTIONS = [
  { value: '', label: 'Select Supplier', disabled: true },
  { value: 'sri-krishna-traders', label: 'Sri Krishna Traders' },
  { value: 'anna-nagar-distributors', label: 'Anna Nagar Distributors' },
  { value: 'metro-wholesale-foods', label: 'Metro Wholesale Foods' },
  { value: 'coimbatore-agro-supplies', label: 'Coimbatore Agro Supplies' },
];

export const OUTLET_OPTIONS = [
  { value: '', label: 'Select From Outlet / HO', disabled: true },
  { value: 'rs-puram', label: 'RS Puram Outlet' },
  { value: 'anna-nagar', label: 'Anna Nagar Outlet' },
  { value: 'market-street', label: 'Market Street Outlet' },
  { value: 'main-warehouse', label: 'Main Warehouse' },
  { value: 'head-office', label: 'Head Office' },
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
    returnedQty: '0.00',
    unitCost: '0.00',
    discount: '0.00',
    tax: '0.00',
    warehouse: '',
    batchNo: '',
    expiryDate: '',
    remarks: '',
  };
}

const itemRowSchema = z.object({
  itemCode: z.string().trim(),
  itemName: z.string().trim(),
  hsnCode: z.string().trim(),
  uom: z.string().trim(),
  returnedQty: z.string().trim(),
  unitCost: z.string().trim(),
  discount: z.string().trim(),
  tax: z.string().trim(),
  warehouse: z.string().trim(),
  batchNo: z.string().trim(),
  expiryDate: z.string().trim(),
  remarks: z.string().trim(),
});

export const createStockReturnSchema = z.object({
  returnDate: z.string().trim().min(1, 'Return date is required'),
  returnType: z.string().trim().min(1, 'Select a return type'),
  referenceType: z.string().trim().min(1, 'Select a reference type'),
  referenceNo: z.string().trim().min(1, 'Select a reference number'),
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
