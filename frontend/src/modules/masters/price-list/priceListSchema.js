import { z } from 'zod';
import { formatPickerDate, parsePickerDate } from '../../../components/form/FormDatePicker';
import { PRICE_LIST_TYPE_OPTIONS, APPLICABLE_TO_OPTIONS, STATUS_OPTIONS } from './priceListMockData';

export { STATUS_OPTIONS };

// FormSelect needs [{value,label}] — these two lists are still plain
// strings (frontend-owned free text, see priceListMockData.js) so they're
// mapped here rather than changing their shape everywhere else they're used
// (the old filter bar on PriceListPage reads them as plain strings too).
export const TYPE_SELECT_OPTIONS = PRICE_LIST_TYPE_OPTIONS.map((v) => ({ value: v, label: v }));
export const APPLICABLE_TO_SELECT_OPTIONS = APPLICABLE_TO_OPTIONS.map((v) => ({ value: v, label: v }));

// Client-side validation mirrors the server's createPriceListSchema (see
// backend/src/modules/price-list/priceList.schema.js) field-for-field, same
// convention as every other *FormDialog in this app (Brand/HsnSac/Selling
// Price) — a request that passes this form can't be rejected by the server
// for a reason the user wasn't already shown.
export const priceListFormSchema = z.object({
  name: z.string().trim().min(1, 'Price list name is required').max(150, 'Name cannot exceed 150 characters'),
  type: z.string().trim().min(1, 'Select a price list type'),
  applicableTo: z.string().trim().min(1, 'Select who this price list applies to'),
  // Empty string means "no base price list" — converted to null in the
  // payload below; kept as '' here (not null) so FormSelect's <TextField
  // select> always has a matching MenuItem value.
  basePriceListId: z.string().trim().optional(),
  currency: z.string().trim().min(1, 'Currency is required').max(10, 'Currency code is too long'),
  effectiveFrom: z.string().trim().optional(),
  effectiveTo: z.string().trim().optional(),
  status: z.string().trim().min(1, 'Select a status'),
}).superRefine((data, ctx) => {
  const from = data.effectiveFrom ? parsePickerDate(data.effectiveFrom) : null;
  const to = data.effectiveTo ? parsePickerDate(data.effectiveTo) : null;
  if (data.effectiveTo && from && to && to < from) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['effectiveTo'], message: 'Effective To cannot be before Effective From' });
  }
});

export const priceListDefaultValues = {
  name: '',
  type: PRICE_LIST_TYPE_OPTIONS[0],
  applicableTo: APPLICABLE_TO_OPTIONS[0],
  basePriceListId: '',
  currency: 'INR',
  effectiveFrom: '',
  effectiveTo: '',
  status: 'Active',
};

// Maps a PriceList row as returned by the API (basePriceList joined in,
// status 'ACTIVE'/'INACTIVE', effectiveFrom/To as ISO date strings or null)
// to react-hook-form values, for editing an existing row via the dialog.
export function priceListToFormValues(row) {
  if (!row) return priceListDefaultValues;
  return {
    name: row.name || '',
    type: row.type || PRICE_LIST_TYPE_OPTIONS[0],
    applicableTo: row.applicableTo || APPLICABLE_TO_OPTIONS[0],
    basePriceListId: row.basePriceListId || row.basePriceList?.id || '',
    currency: row.currency || 'INR',
    effectiveFrom: row.effectiveFrom ? formatPickerDate(new Date(row.effectiveFrom)) : '',
    effectiveTo: row.effectiveTo ? formatPickerDate(new Date(row.effectiveTo)) : '',
    status: String(row.status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active',
  };
}

// Converts the form's values into the real POST/PUT /masters/price-list body.
export function priceListFormValuesToPayload(values) {
  const effectiveFromDate = values.effectiveFrom ? parsePickerDate(values.effectiveFrom) : null;
  const effectiveToDate = values.effectiveTo ? parsePickerDate(values.effectiveTo) : null;

  return {
    name: values.name.trim(),
    type: values.type,
    applicableTo: values.applicableTo,
    basePriceListId: values.basePriceListId || null,
    currency: values.currency.trim(),
    effectiveFrom: effectiveFromDate ? effectiveFromDate.toISOString() : null,
    effectiveTo: effectiveToDate ? effectiveToDate.toISOString() : null,
    status: values.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
  };
}
