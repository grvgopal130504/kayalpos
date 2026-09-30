import { z } from 'zod';

// Kept loose on outletType/state/city (non-empty-when-present, not a hard
// enum) same reasoning as Company's companyType/country/state/currency —
// those option lists live in the frontend's createOutletSchema.js and can
// grow without a matching backend redeploy.
export const createOutletSchema = z.object({
  code: z.string().trim().min(1, 'Outlet code is required'),
  name: z.string().trim().min(1, 'Outlet name is required'),
  isActive: z.boolean().default(true),

  outletType: z.string().trim().optional(),
  companyName: z.string().trim().optional(),
  registrationNo: z.string().trim().optional(),
  gstin: z.string().trim().optional(),
  panNo: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  mobile: z.string().trim().optional(),
  website: z.string().trim().optional(),
  state: z.string().trim().optional(),
  city: z.string().trim().optional(),
  logoName: z.string().trim().optional(),
  addressLine1: z.string().trim().optional(),
  addressLine2: z.string().trim().optional(),
  addressLine3: z.string().trim().optional(),
  addressLine4: z.string().trim().optional(),
  addressLandmark: z.string().trim().optional(),
});

export const updateOutletSchema = createOutletSchema.partial();

export const outletContactSchema = z.object({
  name: z.string().trim().min(1, 'Contact name is required'),
  designation: z.string().trim().optional(),
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  isPrimary: z.coerce.boolean().default(false),
});

export const updateOutletContactSchema = outletContactSchema.partial();
