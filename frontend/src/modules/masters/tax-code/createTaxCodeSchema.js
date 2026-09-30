import { z } from 'zod';
import { formatPickerDate, parsePickerDate } from '../../../components/form/FormDatePicker';

export const TAX_TYPE_OPTIONS = ['GST', 'IGST', 'CESS', 'VAT'];
export const TAX_CATEGORY_OPTIONS = ['GST', 'IGST', 'CESS', 'VAT'];
export const CALCULATION_TYPE_OPTIONS = ['On Gross', 'On Net'];
export const APPLIES_TO_OPTIONS = ['Sales & Purchase', 'Sales Only', 'Purchase Only'];

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const selectOptions = (values) => values.map((v) => ({ value: v, label: v }));
export const TAX_TYPE_SELECT_OPTIONS = selectOptions(TAX_TYPE_OPTIONS);
export const TAX_CATEGORY_SELECT_OPTIONS = selectOptions(TAX_CATEGORY_OPTIONS);
export const CALCULATION_TYPE_SELECT_OPTIONS = selectOptions(CALCULATION_TYPE_OPTIONS);
export const APPLIES_TO_SELECT_OPTIONS = selectOptions(APPLIES_TO_OPTIONS);

// Client-side validation mirrors the server's createTaxCodeSchema (see
// backend/src/modules/tax-code/taxCode.schema.js). `code` is NOT part of
// this schema on Add — it's server-generated (TAX001, ...); on Edit it's
// rendered read-only so there's nothing to validate either way. `rate` is
// kept as a form string (same convention as UOM's conversionFactor) and
// converted with Number() in taxCodeFormValuesToPayload below.
export const createTaxCodeSchema = z.object({
  name: z.string().trim().min(1, 'Tax name is required'),
  type: z.string().trim().min(1, 'Select a tax type'),
  category: z.string().trim().min(1, 'Select a tax category'),
  rate: z.string().trim().min(1, 'Rate is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, 'Enter a rate between 0 and 100'),
  calculationType: z.string().trim().min(1, 'Select a calculation type'),
  appliesTo: z.string().trim().min(1, 'Select what this tax applies to'),
  effectiveFrom: z.string().trim().min(1, 'Select the effective from date'),
  status: z.string().trim().min(1, 'Select a status'),
});

export const createTaxCodeDefaultValues = {
  name: '',
  type: TAX_TYPE_OPTIONS[0],
  category: TAX_CATEGORY_OPTIONS[0],
  rate: '',
  calculationType: CALCULATION_TYPE_OPTIONS[0],
  appliesTo: APPLIES_TO_OPTIONS[0],
  effectiveFrom: '',
  status: 'Active',
};

// Maps a TaxCode row (raw API shape: status 'ACTIVE'/'INACTIVE',
// effectiveFrom as an ISO date string, rate as a Decimal serialized to
// string) to react-hook-form values.
export function taxCodeToFormValues(taxCode) {
  if (!taxCode) return createTaxCodeDefaultValues;
  return {
    name: taxCode.name || '',
    type: taxCode.type || TAX_TYPE_OPTIONS[0],
    category: taxCode.category || TAX_CATEGORY_OPTIONS[0],
    rate: taxCode.rate != null ? String(taxCode.rate) : '',
    calculationType: taxCode.calculationType || CALCULATION_TYPE_OPTIONS[0],
    appliesTo: taxCode.appliesTo || APPLIES_TO_OPTIONS[0],
    effectiveFrom: taxCode.effectiveFrom ? formatPickerDate(new Date(taxCode.effectiveFrom)) : '',
    status: String(taxCode.status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active',
  };
}

// Converts the form's values into the real POST/PUT /masters/tax-code body.
export function taxCodeFormValuesToPayload(values) {
  const parsedDate = parsePickerDate(values.effectiveFrom);
  return {
    name: values.name.trim(),
    type: values.type,
    category: values.category,
    rate: Number(values.rate),
    calculationType: values.calculationType,
    appliesTo: values.appliesTo,
    effectiveFrom: parsedDate ? parsedDate.toISOString() : undefined,
    status: values.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
  };
}
