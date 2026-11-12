import { z } from 'zod';
import { PRODUCT_GROUP_OPTIONS, PRODUCT_TYPE_OPTIONS, UOM_OPTIONS } from './productMockData';

export const PRODUCT_GROUP_SELECT_OPTIONS = PRODUCT_GROUP_OPTIONS.map((v) => ({ value: v, label: v }));
export const PRODUCT_TYPE_SELECT_OPTIONS = [
  { value: '', label: 'Select Product Type', disabled: true },
  ...PRODUCT_TYPE_OPTIONS.map((v) => ({ value: v, label: v })),
];
export const UOM_SELECT_OPTIONS = UOM_OPTIONS.map((v) => ({ value: v, label: v }));

export const BRAND_PLACEHOLDER_OPTION = { value: '', label: 'Select Brand', disabled: true };
export const TAX_CODE_PLACEHOLDER_OPTION = { value: '', label: 'Select Tax Code', disabled: true };

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

// Client-side validation mirrors the server's createProductSchema
// (backend/src/modules/product/product.schema.js) — required fields can't
// be blank and the numeric fields are range-checked before the request ever
// leaves the browser, not just on the server's 400 response. Numeric fields
// are kept as form strings (same convention as Warehouse's capacity fields)
// and converted with Number() in productFormValuesToPayload below.
export const createProductSchema = z.object({
  shortId: z.string().trim().max(20, 'Short ID can be at most 20 characters').optional(),
  name: z.string().trim().min(1, 'Product name is required'),
  group: z.string().trim().min(1, 'Select a product group'),
  productType: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  uom: z.string().trim().min(1, 'Select a UOM'),
  hsnSac: z.string().trim().optional(),
  taxCode: z.string().trim().optional(),
  salePrice: z.string().trim().min(1, 'Sale price is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Enter a valid non-negative amount'),
  mrp: z.string().trim().min(1, 'MRP is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0, 'Enter a valid non-negative amount'),
  availableQty: z.string().trim().min(1, 'Available qty is required')
    .refine((v) => /^\d+$/.test(v.trim()), 'Enter a whole, non-negative number'),
  status: z.string().trim().min(1, 'Select a status'),
});

export const createProductDefaultValues = {
  shortId: '',
  name: '',
  group: '',
  productType: '',
  brand: '',
  uom: '',
  hsnSac: '',
  taxCode: '',
  salePrice: '',
  mrp: '',
  availableQty: '',
  status: 'Active',
};

// Maps a Product row to react-hook-form values. Accepts either shape ProductFormDialog
// can be opened with: the raw API row (GET /masters/product/:id — status:
// 'ACTIVE'/'INACTIVE', salePrice/mrp: Decimal serialized as string) or
// ProductPage's own view-mapped row (status: 'Active'/'Inactive', numeric
// salePrice/mrp) — see ProductPage.jsx's toViewRow, which is what actually
// gets passed in today since Edit is wired from the already-mapped table
// row. Comparing case-insensitively keeps this correct either way.
export function productToFormValues(product) {
  if (!product) return createProductDefaultValues;
  return {
    shortId: product.shortId || '',
    name: product.name || '',
    group: product.group || '',
    productType: product.productType || '',
    brand: product.brand || '',
    uom: product.uom || '',
    hsnSac: product.hsnSac || '',
    taxCode: product.taxCode || '',
    salePrice: product.salePrice != null ? String(product.salePrice) : '',
    mrp: product.mrp != null ? String(product.mrp) : '',
    availableQty: product.availableQty != null ? String(product.availableQty) : '',
    status: String(product.status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active',
  };
}

// Converts the form's values into the real POST/PUT /masters/product body.
export function productFormValuesToPayload(values) {
  return {
    // '' (not undefined) on purpose: clearing the field on Edit must reach
    // the API so the stored Short ID is removed (the API stores blank as NULL).
    shortId: values.shortId?.trim() || '',
    name: values.name.trim(),
    group: values.group,
    productType: values.productType || undefined,
    brand: values.brand || undefined,
    uom: values.uom,
    hsnSac: values.hsnSac?.trim() || undefined,
    taxCode: values.taxCode?.trim() || undefined,
    salePrice: Number(values.salePrice),
    mrp: Number(values.mrp),
    availableQty: Number(values.availableQty),
    status: values.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
  };
}
