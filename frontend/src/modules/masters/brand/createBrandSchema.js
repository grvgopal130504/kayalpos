import { z } from 'zod';

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

// Client-side validation mirrors the server's createBrandSchema (see
// backend/src/modules/brand/brand.schema.js) — required fields can't be
// blank before the request ever leaves the browser, not just on the
// server's 400 response. `code` isn't part of the form at all: the CRUD
// factory auto-generates it (BR0001, BR0002, ...) on create, same as
// Warehouse/Product/Outlet.
export const createBrandSchema = z.object({
  name: z.string().trim().min(1, 'Brand name is required'),
  category: z.string().trim().min(1, 'Category is required'),
  description: z.string().trim().optional(),
  status: z.string().trim().min(1, 'Select a status'),
});

export const createBrandDefaultValues = {
  name: '',
  category: '',
  description: '',
  status: 'Active',
};

// Maps a Brand row (raw API shape: status 'ACTIVE'/'INACTIVE') to
// react-hook-form values (status 'Active'/'Inactive', matching STATUS_OPTIONS).
// Compared case-insensitively so this stays correct whether it's ever handed
// the raw API row or an already-view-mapped one (see ProductPage's
// productToFormValues comment for why that guard matters).
export function brandToFormValues(brand) {
  if (!brand) return createBrandDefaultValues;
  return {
    name: brand.name || '',
    category: brand.category || '',
    description: brand.description || '',
    status: String(brand.status).toUpperCase() === 'INACTIVE' ? 'Inactive' : 'Active',
  };
}

// Converts the form's values into the real POST/PUT /masters/brand body.
export function brandFormValuesToPayload(values) {
  return {
    name: values.name.trim(),
    category: values.category.trim(),
    description: values.description?.trim() || undefined,
    status: values.status === 'Inactive' ? 'INACTIVE' : 'ACTIVE',
  };
}
