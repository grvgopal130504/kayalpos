import { z } from 'zod';
import { formatPickerDate, parsePickerDate } from '../../../components/form/FormDatePicker';

export const TYPE_OPTIONS = ['HSN', 'SAC'];
export const CHAPTER_OPTIONS = [
  '10 - Cereals',
  '11 - Products of the Milling Industry',
  '17 - Sugars and Sugar Confectionery',
  '21 - Miscellaneous Edible Preparations',
  '22 - Beverages, Spirits and Vinegar',
  '24 - Tobacco and Manufactured Tobacco',
  '48 - Paper and Paperboard',
  '99 - Services',
];
export const TAX_RATE_OPTIONS = [0, 5, 12, 18, 28];

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

const selectOptions = (values) => values.map((v) => ({ value: v, label: v }));
export const TYPE_SELECT_OPTIONS = selectOptions(TYPE_OPTIONS);
export const CHAPTER_SELECT_OPTIONS = selectOptions(CHAPTER_OPTIONS);

// Client-side validation mirrors the server's createHsnSacSchema (see
// backend/src/modules/hsn-sac/hsnSac.schema.js). `code` IS part of this
// form — like UOM, an HSN/SAC code is a real classification code the user
// looks up and enters, not server-generated. `taxRate` is kept as a form
// string (same convention as TaxCode's rate) and converted with Number() in
// hsnSacFormValuesToPayload below.
export const createHsnSacSchema = z.object({
  code: z.string().trim().min(1, 'HSN / SAC code is required'),
  description: z.string().trim().min(1, 'Description is required'),
  type: z.string().trim().min(1, 'Select a type'),
  chapter: z.string().trim().optional(),
  taxRate: z.string().trim().min(1, 'Tax rate is required')
    .refine((v) => !Number.isNaN(Number(v)) && Number(v) >= 0 && Number(v) <= 100, 'Enter a rate between 0 and 100'),
  uqc: z.string().trim().optional(),
  effectiveFrom: z.string().trim().min(1, 'Select the effective from date'),
  status: z.string().trim().min(1, 'Select a status'),
});

export const createHsnSacDefaultValues = {
  code: '',
  description: '',
  type: TYPE_OPTIONS[0],
  chapter: CHAPTER_OPTIONS[0],
  taxRate: '',
  uqc: '',
  effectiveFrom: '',
  status: 'Active',
};

// Maps an HsnSac row (raw API shape: status 'ACTIVE'/'INACTIVE',
// effectiveFrom as an ISO date string, taxRate as a Decimal serialized to
// string) to react-hook-form values.
export function hsnSacToFormValues(hsnSac) {
  if (!hsnSac) return createHsnSacDefaultValues;
  return {
    code: hsnSac.code || '',
    description: hsnSac.description || '',
    type: hsnSac.type || TYPE_OPTIONS[0],
    chapter: hsnSac.chapter || CHAPTER_OPTIONS[0],
    taxRate: hsnSac.taxRate != null ? String(hsnSac.taxRate) : '',
    uqc: hsnSac.uqc || '',
    effectiveFrom: hsnSac.effectiveFrom ? formatPickerDate(new Date(hsnSac.effectiveFrom)) : '',
    status: String(hsnSac.status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active',
  };
}

// Converts the form's values into the real POST/PUT /masters/hsn-sac body.
export function hsnSacFormValuesToPayload(values) {
  const parsedDate = parsePickerDate(values.effectiveFrom);
  return {
    code: values.code.trim(),
    description: values.description.trim(),
    type: values.type,
    chapter: values.chapter || undefined,
    taxRate: Number(values.taxRate),
    uqc: values.uqc?.trim() || undefined,
    effectiveFrom: parsedDate ? parsedDate.toISOString() : undefined,
    status: values.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
  };
}
