import { z } from 'zod';

// Query params for GET /masters/batch-serial. Always paginated, same
// convention as priceList.schema.js/sellingPrice.schema.js's own query
// schemas.
export const batchSerialQuerySchema = z.object({
  search: z.string().trim().optional(),
  type: z.enum(['BATCH', 'SERIAL']).optional(),
  warehouseId: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'All']).optional(),
  page: z.coerce.number().int('Page must be a whole number').positive('Page must be at least 1').default(1),
  pageSize: z.coerce.number().int('Page size must be a whole number').positive('Page size must be at least 1')
    .max(200, 'Page size cannot exceed 200').default(50),
});

// `uom` is optional on input — batchSerial.service.js falls back to the
// selected Product's own `uom` when it's left blank (see createBatchSerial's
// doc comment), same "auto-filled but overridable" convention as Selling
// Price's taxCode/taxRate being populated from the picked Product/Tax Code.
// `warehouseId` is required here even though the database column is
// nullable (see the model's own doc comment in schema.prisma for why).
const batchSerialBaseSchema = z.object({
  productId: z.string().trim().min(1, 'Select an item'),
  number: z.string().trim().min(1, 'Batch / Serial number is required').max(60, 'Number cannot exceed 60 characters'),
  type: z.enum(['BATCH', 'SERIAL'], { errorMap: () => ({ message: 'Select a batch or serial type' }) }),
  mfgDate: z.coerce.date({ invalid_type_error: 'Enter a valid manufacturing date' }).optional().nullable(),
  expiryDate: z.coerce.date({ invalid_type_error: 'Enter a valid expiry date' }).optional().nullable(),
  warehouseId: z.string().trim().min(1, 'Select a warehouse / outlet'),
  qty: z.coerce.number().positive('Quantity must be greater than 0'),
  uom: z.string().trim().max(20, 'UOM cannot exceed 20 characters').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

function withBusinessRules(schema) {
  return schema.superRefine((data, ctx) => {
    if (data.mfgDate && data.expiryDate && data.expiryDate < data.mfgDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiryDate'], message: 'Expiry date cannot be before the manufacturing date' });
    }
    // A serial number identifies exactly one physical unit — it can't carry
    // an expiry (serial-tracked items like electronics don't "expire" the
    // way a food/pharma batch does) and its quantity is always exactly 1,
    // same rule the frontend's disabled Expiry Date field and fixed qty
    // enforce visually; this is the server-side backstop.
    if (data.type === 'SERIAL') {
      if (data.expiryDate) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiryDate'], message: 'Serial-tracked items cannot have an expiry date' });
      }
      if (data.qty !== undefined && Number(data.qty) !== 1) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['qty'], message: 'Serial-tracked quantity must be exactly 1' });
      }
    }
  });
}

export const createBatchSerialSchema = withBusinessRules(batchSerialBaseSchema);
export const updateBatchSerialSchema = withBusinessRules(batchSerialBaseSchema.partial());
