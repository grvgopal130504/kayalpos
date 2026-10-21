import { z } from 'zod';

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

// Client-side validation mirrors the server's createUomGroupSchema (see
// backend/src/modules/uom/uomGroup.schema.js). `code` isn't part of the
// form — the CRUD factory auto-generates it (GRP001, GRP002, ...) on
// create, same as Brand.
export const BASE_UOM_PLACEHOLDER_OPTION = { value: '', label: 'None' };

export const createUomGroupSchema = z.object({
  name: z.string().trim().min(1, 'Group name is required'),
  description: z.string().trim().optional(),
  baseUom: z.string().trim().optional(),
  status: z.string().trim().min(1, 'Select a status'),
});

export const createUomGroupDefaultValues = {
  name: '',
  description: '',
  baseUom: '',
  status: 'Active',
};

export function uomGroupToFormValues(group) {
  if (!group) return createUomGroupDefaultValues;
  return {
    name: group.name || '',
    description: group.description || '',
    baseUom: group.baseUom || '',
    status: String(group.status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active',
  };
}

export function uomGroupFormValuesToPayload(values) {
  return {
    name: values.name.trim(),
    description: values.description?.trim() || undefined,
    baseUom: values.baseUom || undefined,
    status: values.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
  };
}
