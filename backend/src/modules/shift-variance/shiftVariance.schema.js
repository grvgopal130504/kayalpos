import { z } from 'zod';

const dateKey = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

// Query params for GET /shift-variance. `from`/`to` bound the shift's OPENING
// date (server-local calendar days, same convention as every other cashier
// report's dayBounds); both default in the service to the last 7 days.
// `outletId` is a real outlet id or "all"; omitted = the caller's own outlet.
// `status` filters the table only (never the summary cards).
export const SHIFT_VARIANCE_STATUSES = [
  'all', 'shortage', 'excess', 'balanced', 'pending', 'missing', 'unresolved',
];

export const shiftVarianceQuerySchema = z.object({
  from: dateKey.optional(),
  to: dateKey.optional(),
  outletId: z.string().trim().min(1).optional(),
  cashierId: z.string().trim().min(1).optional(),
  status: z.enum(SHIFT_VARIANCE_STATUSES).default('all'),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
});
