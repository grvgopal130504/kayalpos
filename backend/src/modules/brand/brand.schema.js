import { z } from 'zod';

// `code` is intentionally NOT required here — the CRUD factory
// auto-generates it (BR001, BR002, ...) on create. If the client sends one
// anyway (e.g. a future "duplicate brand" feature) it's respected as-is.
export const createBrandSchema = z.object({
  code: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1, 'Brand name is required'),
  description: z.string().trim().optional().nullable(),
  category: z.string().trim().min(1, 'Category is required'),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateBrandSchema = createBrandSchema.partial();
