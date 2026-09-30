import { z } from 'zod';
import { formatPickerDate, parsePickerDate } from '../../../components/form/FormDatePicker';
import { BATCH_SERIAL_TYPE_OPTIONS, STATUS_OPTIONS } from './batchSerialMockData';

export { STATUS_OPTIONS };

// FormSelect needs [{value,label}] — Batch/Serial Type stays a plain
// Active/Inactive-style string pair in the UI ('Batch'/'Serial') and is
// mapped to the backend's BATCH/SERIAL enum in the payload converter below,
// same "Active"/"ACTIVE" convention used by every other master's status.
export const TYPE_SELECT_OPTIONS = BATCH_SERIAL_TYPE_OPTIONS.map((v) => ({ value: v, label: v }));

// Client-side validation mirrors the server's createBatchSerialSchema (see
// backend/src/modules/batch-serial/batchSerial.schema.js) field-for-field —
// a request that passes this form can't be rejected by the server for a
// reason the user wasn't already shown. Numeric fields are kept as form
// strings (same convention as Product/Selling Price) and converted with
// Number() in batchSerialFormValuesToPayload below. `productId`/`productCode`
// are filled in by ItemCodeAutocomplete (see BatchSerialFormDialog.jsx), not
// typed directly.
export const batchSerialFormSchema = z.object({
  productId: z.string().trim().min(1, 'Select an item'),
  productCode: z.string().trim().min(1, 'Select an item'),
  number: z.string().trim().min(1, 'Batch / serial number is required').max(60, 'Number cannot exceed 60 characters'),
  type: z.enum(BATCH_SERIAL_TYPE_OPTIONS, { errorMap: () => ({ message: 'Select a batch or serial type' }) }),
  mfgDate: z.string().trim().optional(),
  expiryDate: z.string().trim().optional(),
  warehouseId: z.string().trim().min(1, 'Select a warehouse / outlet'),
  qty: z.string().trim().min(1, 'Quantity is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) > 0, 'Quantity must be greater than 0'),
  uom: z.string().trim().min(1, 'UOM is required').max(20, 'UOM cannot exceed 20 characters'),
  status: z.string().trim().min(1, 'Select a status'),
}).superRefine((data, ctx) => {
  const mfg = data.mfgDate ? parsePickerDate(data.mfgDate) : null;
  const expiry = data.expiryDate ? parsePickerDate(data.expiryDate) : null;
  if (data.expiryDate && mfg && expiry && expiry < mfg) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiryDate'], message: 'Expiry date cannot be before the manufacturing date' });
  }
  if (data.type === 'Serial') {
    if (data.expiryDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiryDate'], message: 'Serial-tracked items cannot have an expiry date' });
    }
    if (Number(data.qty) !== 1) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['qty'], message: 'Serial-tracked quantity must be exactly 1' });
    }
  }
});

export const batchSerialDefaultValues = {
  productId: '',
  productCode: '',
  number: '',
  type: 'Batch',
  mfgDate: formatPickerDate(new Date()),
  expiryDate: '',
  warehouseId: '',
  qty: '1',
  uom: '',
  status: 'Active',
};

// Maps a BatchSerial row as returned by the API (product/warehouse joined
// in, status 'ACTIVE'/'INACTIVE', type 'BATCH'/'SERIAL', qty a Decimal
// serialized to string, mfgDate/expiryDate as ISO date strings or null) to
// react-hook-form values, for editing an existing row via the dialog.
export function batchSerialToFormValues(row) {
  if (!row) return batchSerialDefaultValues;
  return {
    productId: row.productId || row.product?.id || '',
    productCode: row.product?.code || '',
    number: row.number || '',
    type: row.type === 'SERIAL' ? 'Serial' : 'Batch',
    mfgDate: row.mfgDate ? formatPickerDate(new Date(row.mfgDate)) : '',
    expiryDate: row.expiryDate ? formatPickerDate(new Date(row.expiryDate)) : '',
    warehouseId: row.warehouseId || row.warehouse?.id || '',
    qty: row.qty != null ? String(row.qty) : '1',
    uom: row.uom || row.product?.uom || '',
    status: String(row.status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active',
  };
}

// Converts the form's values into the real POST/PUT
// /masters/batch-serial body.
export function batchSerialFormValuesToPayload(values) {
  const mfgDate = values.mfgDate ? parsePickerDate(values.mfgDate) : null;
  const expiryDate = values.type === 'Serial' ? null : (values.expiryDate ? parsePickerDate(values.expiryDate) : null);

  return {
    productId: values.productId,
    number: values.number.trim(),
    type: values.type === 'Serial' ? 'SERIAL' : 'BATCH',
    mfgDate: mfgDate ? mfgDate.toISOString() : null,
    expiryDate: expiryDate ? expiryDate.toISOString() : null,
    warehouseId: values.warehouseId,
    qty: Number(values.qty),
    uom: values.uom.trim(),
    status: values.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
  };
}
