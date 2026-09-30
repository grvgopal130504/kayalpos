import { z } from 'zod';

// `code` is intentionally NOT required here — the CRUD factory
// auto-generates it (TAX001, TAX002, ...) on create, same convention as
// Brand/UomGroup. If the client sends one anyway it's respected as-is.
export const createTaxCodeSchema = z.object({
  code: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1, 'Tax name is required'),
  type: z.string().trim().min(1, 'Tax type is required'),
  category: z.string().trim().min(1, 'Tax category is required'),
  rate: z.coerce.number({ invalid_type_error: 'Enter a valid rate' })
    .min(0, 'Rate must be 0 or more')
    .max(100, 'Rate must be 100 or less'),
  calculationType: z.string().trim().min(1, 'Calculation type is required'),
  appliesTo: z.string().trim().min(1, 'Applies To is required'),
  // Accepted as an ISO date string from the frontend (converted from the
  // FormDatePicker's "DD Mon YYYY" display value before it's sent) and
  // coerced straight into a Date for Prisma.
  effectiveFrom: z.coerce.date({ invalid_type_error: 'Enter a valid date' }).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateTaxCodeSchema = createTaxCodeSchema.partial();
