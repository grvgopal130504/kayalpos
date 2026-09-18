import { z } from 'zod';

// `code` is intentionally NOT required — the CRUD factory auto-generates it
// (PROD0001, PROD0002, ...) on create, matching the frontend's mock data
// convention (4-digit sequence).
export const createProductSchema = z.object({
  code: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1, 'Product name is required'),
  group: z.string().trim().min(1, 'Product group is required'),
  brand: z.string().trim().optional().nullable(),
  uom: z.string().trim().min(1, 'UOM is required'),
  hsnSac: z.string().trim().optional().nullable(),
  taxCode: z.string().trim().optional().nullable(),
  salePrice: z.coerce.number().nonnegative('Sale price cannot be negative').default(0),
  mrp: z.coerce.number().nonnegative('MRP cannot be negative').default(0),
  availableQty: z.coerce.number().int('Available qty must be a whole number').nonnegative('Available qty cannot be negative').default(0),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateProductSchema = createProductSchema.partial();
