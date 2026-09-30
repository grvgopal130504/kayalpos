import { z } from 'zod';

// Empty-string-from-a-cleared-select becomes undefined so it's never sent
// as an invalid foreign key — same "convert blank optional select to
// undefined" treatment createOutletSchema.js's frontend counterpart gives
// outletType/state/city, just done here too since outletId is a real FK
// (see schema.prisma's Warehouse.outletId) rather than a free-text column.
const optionalOutletId = z.string().trim().optional().or(z.literal('')).transform((v) => (v ? v : undefined));

// Kept as plain optional strings (not z.coerce.number()) same as every other
// "amount typed into a text field" in this app — Prisma's Decimal columns
// (see Warehouse.totalCapacity/usedCapacity) accept a numeric string
// directly, so there's no need to round-trip through a JS number here.
const optionalDecimalString = z.string().trim().optional().or(z.literal(''))
  .refine((v) => !v || !Number.isNaN(Number(v)), 'Enter a valid number')
  .transform((v) => (v ? v : undefined));

// Kept loose on warehouseType/location/state/country (non-empty-when-present,
// not a hard enum) same reasoning as Outlet/Company's own free-text option
// fields — those option lists live in the frontend's createWarehouseSchema.js
// and can grow without a matching backend redeploy.
export const createWarehouseSchema = z.object({
  code: z.string().trim().min(1, 'Warehouse code is required'),
  name: z.string().trim().min(1, 'Warehouse name is required'),
  isActive: z.boolean().default(true),

  warehouseType: z.string().trim().optional(),
  location: z.string().trim().optional(),
  companyName: z.string().trim().optional(),
  outletId: optionalOutletId,
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  address: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  landmark: z.string().trim().optional(),

  totalCapacity: optionalDecimalString,
  usedCapacity: optionalDecimalString,
  capacityUnit: z.string().trim().optional(),

  inchargeName: z.string().trim().optional(),
  inchargePhone: z.string().trim().optional(),

  logoName: z.string().trim().optional(),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

export const warehouseContactSchema = z.object({
  name: z.string().trim().min(1, 'Contact name is required'),
  designation: z.string().trim().optional(),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  isPrimary: z.coerce.boolean().default(false),
});

export const updateWarehouseContactSchema = warehouseContactSchema.partial();
