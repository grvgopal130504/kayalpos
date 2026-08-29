import { z } from 'zod';

export const LABEL_TYPE_OPTIONS = [
  { value: 'barcode', label: 'Barcode' },
  { value: 'qr-code', label: 'QR Code' },
  { value: 'price-tag', label: 'Price Tag' },
];

export const LABEL_SIZE_OPTIONS = [
  { value: '', label: 'Select Label Size', disabled: true },
  { value: '25x15', label: '25mm x 15mm' },
  { value: '50x25', label: '50mm x 25mm' },
  { value: '75x50', label: '75mm x 50mm' },
  { value: '100x50', label: '100mm x 50mm' },
];

export const PRINT_TEMPLATE_OPTIONS = [
  { value: '', label: 'Select Template', disabled: true },
  { value: 'standard-2col', label: 'Standard 2-Column' },
  { value: 'standard-3col', label: 'Standard 3-Column' },
  { value: 'compact-4col', label: 'Compact 4-Column' },
];

export const ITEM_CATEGORY_OPTIONS = [
  { value: '', label: 'Select Item Category', disabled: true },
  { value: 'grocery', label: 'Grocery' },
  { value: 'beverages', label: 'Beverages' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'household', label: 'Household' },
  { value: 'personal-care', label: 'Personal Care' },
];

export const ITEM_OPTIONS = [
  { value: '', label: 'Select Item', disabled: true },
  { value: 'ITM-0001', label: 'Rice 10kg' },
  { value: 'ITM-0002', label: 'Sugar 1kg' },
  { value: 'ITM-0003', label: 'Toor Dal 1kg' },
  { value: 'ITM-0004', label: 'Tea Powder 250g' },
  { value: 'ITM-0005', label: 'Sunflower Oil 1L' },
];

export const UOM_OPTIONS = [
  { value: '', label: 'Select UoM', disabled: true },
  { value: 'nos', label: 'Nos' },
  { value: 'kg', label: 'Kg' },
  { value: 'ltr', label: 'Ltr' },
  { value: 'box', label: 'Box' },
];

export const BRAND_OPTIONS = [
  { value: '', label: 'Select Brand', disabled: true },
  { value: 'nexora-staples', label: 'Nexora Staples' },
  { value: 'daily-fresh', label: 'Daily Fresh' },
  { value: 'homecare-plus', label: 'HomeCare Plus' },
];

export const WAREHOUSE_OPTIONS = [
  { value: '', label: 'Select Warehouse', disabled: true },
  { value: 'main-warehouse', label: 'Main Warehouse' },
  { value: 'store-front', label: 'Store Front' },
  { value: 'cold-storage', label: 'Cold Storage' },
];

export const BARCODE_TYPE_OPTIONS = [
  { value: 'ean-13', label: 'EAN-13' },
  { value: 'code-128', label: 'CODE-128' },
  { value: 'upc-a', label: 'UPC-A' },
  { value: 'qr', label: 'QR' },
];

export const ADDITIONAL_FILTER_OPTIONS = [
  { value: '', label: 'Select' },
  { value: 'low-stock', label: 'Low Stock Items Only' },
  { value: 'no-barcode', label: 'Items Without Barcode' },
  { value: 'new-arrivals', label: 'New Arrivals' },
];

export const SORT_BY_OPTIONS = [
  { value: 'item-name', label: 'Item Name' },
  { value: 'item-code', label: 'Item Code' },
  { value: 'category', label: 'Category' },
];

export function emptyItemRow() {
  return {
    selected: false,
    itemCode: '',
    itemName: '',
    hsnCode: '',
    uom: '',
    barcode: '',
    printQty: '1.00',
    fromSerialBatch: '',
    toSerialBatch: '',
  };
}

// The reference design ships the create screen with 5 sample items already
// resolved from the filter criteria (unlike Quotation/Order/Invoice, which
// start with blank rows) — mirroring that here.
export function sampleItemRow({ code, name, hsn, uom, barcode }) {
  return {
    selected: false,
    itemCode: code,
    itemName: name,
    hsnCode: hsn,
    uom,
    barcode,
    printQty: '1.00',
    fromSerialBatch: '',
    toSerialBatch: '',
  };
}

const itemRowSchema = z.object({
  selected: z.boolean(),
  itemCode: z.string().trim(),
  itemName: z.string().trim(),
  hsnCode: z.string().trim(),
  uom: z.string().trim(),
  barcode: z.string().trim(),
  printQty: z.string().trim(),
  fromSerialBatch: z.string().trim(),
  toSerialBatch: z.string().trim(),
});

export const createBarcodeLabelSchema = z.object({
  labelName: z.string().trim().min(1, 'Label name is required'),
  labelType: z.string().trim().min(1, 'Select a label type'),
  labelSize: z.string().trim().min(1, 'Select a label size'),
  printTemplate: z.string().trim().optional(),
  labelsAcross: z.string().trim().optional(),
  labelsDown: z.string().trim().optional(),
  remarks: z.string().trim().optional(),
  itemCategory: z.string().trim().optional(),
  item: z.string().trim().optional(),
  uom: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  warehouse: z.string().trim().optional(),
  batchNo: z.string().trim().optional(),
  fromItemCode: z.string().trim().optional(),
  toItemCode: z.string().trim().optional(),
  barcodeType: z.string().trim(),
  additionalFilter: z.string().trim().optional(),
  sortBy: z.string().trim(),
  notes: z.string().trim().optional(),
  items: z.array(itemRowSchema),
});

export const createBarcodeLabelDefaultValues = {
  labelName: '',
  labelType: 'barcode',
  labelSize: '',
  printTemplate: '',
  labelsAcross: '',
  labelsDown: '',
  remarks: '',
  itemCategory: '',
  item: '',
  uom: '',
  brand: '',
  warehouse: '',
  batchNo: '',
  fromItemCode: '',
  toItemCode: '',
  barcodeType: 'ean-13',
  additionalFilter: '',
  sortBy: 'item-name',
  notes: '',
  items: [
    sampleItemRow({ code: 'ITM-0001', name: 'Rice 10kg', hsn: '1006', uom: 'Nos', barcode: '8901234567890' }),
    sampleItemRow({ code: 'ITM-0002', name: 'Sugar 1kg', hsn: '1701', uom: 'Nos', barcode: '8901234567891' }),
    sampleItemRow({ code: 'ITM-0003', name: 'Toor Dal 1kg', hsn: '0713', uom: 'Nos', barcode: '8901234567892' }),
    sampleItemRow({ code: 'ITM-0004', name: 'Tea Powder 250g', hsn: '0902', uom: 'Nos', barcode: '8901234567893' }),
    sampleItemRow({ code: 'ITM-0005', name: 'Sunflower Oil 1L', hsn: '1512', uom: 'Nos', barcode: '8901234567894' }),
  ],
};
