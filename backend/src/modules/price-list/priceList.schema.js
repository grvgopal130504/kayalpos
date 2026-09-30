import { z } from 'zod';

// Query params for GET /masters/price-list. Always paginated, same
// convention as sellingPrice.schema.js's sellingPriceQuerySchema.
export const priceListQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: z.string().trim().optional(),
  applicableTo: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'All']).optional(),
  page: z.coerce.number().int('Page must be a whole number').positive('Page must be at least 1').default(1),
  pageSize: z.coerce.number().int('Page size must be a whole number').positive('Page size must be at least 1')
    .max(200, 'Page size cannot exceed 200').default(50),
});

// `code` is NOT required from the client — priceList.service.js
// auto-generates it (PL001, PL002, ...) on create, same convention as
// Brand/Outlet. `basePriceListId` is nullable (no base list picked).
const priceListBaseSchema = z.object({
  code: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1, 'Price list name is required').max(150, 'Name cannot exceed 150 characters'),
  type: z.string().trim().min(1, 'Select a price list type'),
  applicableTo: z.string().trim().min(1, 'Select who this price list applies to'),
  basePriceListId: z.string().trim().optional().nullable(),
  currency: z.string().trim().min(1, 'Currency is required').max(10, 'Currency code is too long').default('INR'),
  effectiveFrom: z.coerce.date({ invalid_type_error: 'Enter a valid Effective From date' }).optional().nullable(),
  effectiveTo: z.coerce.date({ invalid_type_error: 'Enter a valid Effective To date' }).optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

function withDateRangeCheck(schema) {
  return schema.superRefine((data, ctx) => {
    if (data.effectiveFrom && data.effectiveTo && data.effectiveTo < data.effectiveFrom) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['effectiveTo'], message: 'Effective To cannot be before Effective From' });
    }
  });
}

export const createPriceListSchema = withDateRangeCheck(priceListBaseSchema);
export const updatePriceListSchema = withDateRangeCheck(priceListBaseSchema.partial());
