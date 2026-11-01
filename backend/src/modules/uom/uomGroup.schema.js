import { z } from 'zod';

// `code` is intentionally NOT required here — the CRUD factory
// auto-generates it (GRP001, GRP002, ...) on create, same as Brand.
export const createUomGroupSchema = z.object({
  code: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1, 'Group name is required'),
  description: z.string().trim().optional().nullable(),
  baseUom: z.string().trim().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateUomGroupSchema = createUomGroupSchema.partial();
