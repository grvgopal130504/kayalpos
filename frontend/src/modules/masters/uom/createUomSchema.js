import { z } from 'zod';

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

export const GROUP_PLACEHOLDER_OPTION = { value: '', label: 'Select UOM Group', disabled: true };

// Client-side validation mirrors the server's createUomSchema (see
// backend/src/modules/uom/uom.schema.js). Unlike UOM Group, `code` IS part
// of this form — a UOM's code (KG, PC, LTR, ...) is a short mnemonic the
// user picks, not an auto-generated sequence. `conversionFactor` is kept as
// a form string (same convention as Warehouse's capacity fields) and
// converted with Number() in uomFormValuesToPayload below.
export const createUomSchema = z.object({
  code: z.string().trim().min(1, 'UOM code is required'),
  name: z.string().trim().min(1, 'UOM name is required'),
  groupId: z.string().trim().optional(),
  conversionFactor: z.string().trim().optional()
    .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) > 0), 'Enter a valid positive number'),
  status: z.string().trim().min(1, 'Select a status'),
});

export const createUomDefaultValues = {
  code: '',
  name: '',
  groupId: '',
  conversionFactor: '1',
  status: 'Active',
};

// Maps a Uom row (raw API shape: status 'ACTIVE'/'INACTIVE', group as a
// nested { id, name } object from the list/detail `select`/`include`,
// conversionFactor as a Decimal serialized to string) to react-hook-form
// values.
export function uomToFormValues(uom) {
  if (!uom) return createUomDefaultValues;
  return {
    code: uom.code || '',
    name: uom.name || '',
    groupId: uom.groupId || uom.group?.id || '',
    conversionFactor: uom.conversionFactor != null ? String(uom.conversionFactor) : '1',
    status: String(uom.status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active',
  };
}

// Converts the form's values into the real POST/PUT /masters/uom body.
export function uomFormValuesToPayload(values) {
  return {
    code: values.code.trim(),
    name: values.name.trim(),
    groupId: values.groupId || undefined,
    conversionFactor: values.conversionFactor?.trim() || undefined,
    status: values.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
  };
}
