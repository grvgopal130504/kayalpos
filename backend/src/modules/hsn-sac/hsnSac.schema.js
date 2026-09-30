import { z } from 'zod';

// `code` IS required from the client, unlike Brand/TaxCode — HSN/SAC codes
// (10019010, 995433, ...) are real externally-defined classification codes
// the user looks up and enters, not an auto-generated sequence, so no
// `codePrefix` is passed to the CRUD factory for this router (see
// hsnSac.routes.js) — same convention as UOM's code.
export const createHsnSacSchema = z.object({
  code: z.string().trim().min(1, 'HSN / SAC code is required'),
  description: z.string().trim().min(1, 'Description is required'),
  type: z.string().trim().min(1, 'Type is required'),
  chapter: z.string().trim().optional().nullable(),
  taxRate: z.coerce.number({ invalid_type_error: 'Enter a valid tax rate' })
    .min(0, 'Tax rate must be 0 or more')
    .max(100, 'Tax rate must be 100 or less'),
  uqc: z.string().trim().optional().nullable(),
  // Accepted as an ISO date string from the frontend (converted from the
  // FormDatePicker's "DD Mon YYYY" display value before it's sent).
  effectiveFrom: z.coerce.date({ invalid_type_error: 'Enter a valid date' }).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateHsnSacSchema = createHsnSacSchema.partial();
