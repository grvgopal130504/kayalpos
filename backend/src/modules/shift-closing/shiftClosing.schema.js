import { z } from 'zod';

// Read-only report — there is no create schema here. Closing a shift is
// its own action, POST /shift-sessions/close (see shiftSession.service.js's
// closeShift, validated by shiftSession.schema.js's closeShiftSchema) —
// this module only reports on the CLOSED ShiftSession rows that action
// leaves behind, the same read-only relationship cashDrawerOpening has
// with ShiftSession rows created by openShift. Same shape/semantics as
// cashDrawerOpeningQuerySchema.
export const shiftClosingQuerySchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.coerce.number().int('Page must be a whole number').positive('Page must be at least 1').default(1),
  pageSize: z.coerce.number().int('Page size must be a whole number').positive('Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100').default(10),
});
