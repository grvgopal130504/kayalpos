import { z } from 'zod';

// Empty-string-from-a-cleared-select becomes undefined so it's never sent as
// an invalid foreign key — same treatment createWarehouseSchema.js gives
// outletId, since groupId is a real FK (see schema.prisma's Uom.groupId).
const optionalGroupId = z.string().trim().optional().or(z.literal('')).transform((v) => (v ? v : undefined));

// Kept as a plain optional string (not z.coerce.number()), same as
// Warehouse's capacity fields — Prisma's Decimal column (Uom.conversionFactor)
// accepts a numeric string directly.
const optionalDecimalString = z.string().trim().optional().or(z.literal(''))
  .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) > 0), 'Enter a valid positive number')
  .transform((v) => (v ? v : undefined));

// Unlike Brand/UomGroup, `code` here is required from the client — UOM codes
// (KG, PC, LTR, ...) are short mnemonic abbreviations the user picks, not an
// auto-generated sequence, so no `codePrefix` is passed to the CRUD factory
// for this router (see uom.routes.js).
export const createUomSchema = z.object({
  code: z.string().trim().min(1, 'UOM code is required'),
  name: z.string().trim().min(1, 'UOM name is required'),
  groupId: optionalGroupId,
  conversionFactor: optionalDecimalString,
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const updateUomSchema = createUomSchema.partial();
