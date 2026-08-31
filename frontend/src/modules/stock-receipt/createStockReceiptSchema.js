import { z } from 'zod';

export const PURCHASE_TYPE_OPTIONS = [
  { value: '', label: 'Select Purchase Type', disabled: true },
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Purchase Return Reversal', label: 'Purchase Return Reversal' },
  { value: 'Consignment', label: 'Consignment' },
  { value: 'Direct Receipt', label: 'Direct Receipt' },
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

// Ordered/Received Qty come pre-filled per row (e.g. from a linked Purchase
// Order / GRN) while the item itself is still unselected, matching the
// reference design's default 5-row grid.
export function emptyItemRow({ orderedQty = '', receivedQty = '' } = {}) {
  return {
    itemCode: '',
    itemName: '',
    hsnCode: '',
    uom: '',
    orderedQty,
    receivedQty,
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
  orderedQty: z.string().trim(),
  receivedQty: z.string().trim(),
  unitCost: z.string().trim(),
  discount: z.string().trim(),
  tax: z.string().trim(),
  warehouse: z.string().trim(),
  batchNo: z.string().trim(),
  expiryDate: z.string().trim(),
  remarks: z.string().trim(),
});

export const createStockReceiptSchema = z.object({
  receiptDate: z.string().trim().min(1, 'Receipt date is required'),
  purchaseType: z.string().trim().min(1, 'Select a purchase type'),
  purchaseInvoiceNo: z.string().trim().optional(),
  purchaseInvoiceDate: z.string().trim().optional(),
  grnDcNo: z.string().trim().optional(),
  grnDcDate: z.string().trim().optional(),
  receiptRemarks: z.string().trim().optional(),

  supplier: z.string().trim().min(1, 'Select a supplier'),
  fromOutlet: z.string().trim().min(1, 'Select a from outlet / HO'),
  costCenter: z.string().trim().optional(),
  contactPerson: z.string().trim().optional(),
  mobileNo: z.string().trim().optional(),

  referenceNo: z.string().trim().optional(),
  vehicleNo: z.string().trim().optional(),
  transporter: z.string().trim().optional(),
  deliveryChallanNo: z.string().trim().optional(),
  otherRemarks: z.string().trim().optional(),

  notes: z.string().trim().optional(),
  items: z.array(itemRowSchema),
});

export const createStockReceiptDefaultValues = {
  receiptDate: todayFormatted(),
  purchaseType: 'Purchase',
  purchaseInvoiceNo: '',
  purchaseInvoiceDate: '',
  grnDcNo: '',
  grnDcDate: '',
  receiptRemarks: '',

  supplier: '',
  fromOutlet: '',
  costCenter: '',
  contactPerson: '',
  mobileNo: '',

  referenceNo: '',
  vehicleNo: '',
  transporter: '',
  deliveryChallanNo: '',
  otherRemarks: '',

  notes: '',
  items: [
    emptyItemRow({ orderedQty: '10.00', receivedQty: '10.00' }),
    emptyItemRow({ orderedQty: '5.00', receivedQty: '5.00' }),
    emptyItemRow({ orderedQty: '20.00', receivedQty: '15.00' }),
    emptyItemRow({ orderedQty: '15.00', receivedQty: '15.00' }),
    emptyItemRow({ orderedQty: '10.00', receivedQty: '10.00' }),
  ],
};
