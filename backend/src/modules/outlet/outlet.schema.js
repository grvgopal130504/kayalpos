import { z } from 'zod';

export const createOutletSchema = z.object({
  code: z.string().trim().min(1, 'Outlet code is required'),
  name: z.string().trim().min(1, 'Outlet name is required'),
  isActive: z.boolean().default(true),
});

export const updateOutletSchema = createOutletSchema.partial();
