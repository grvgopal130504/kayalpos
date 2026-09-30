import { z } from 'zod';

// Every field here is optional — the dashboard is fully usable with no
// query params at all (tenant-wide, "month" period everywhere). Server-side
// validation still matters even though nothing here is a mutation: a typo'd
// outletId or period should fail loudly with a 400, not silently fall
// through to a query that returns nothing and looks like a bug.
const PERIOD_VALUES = ['week', 'month'];

export const homeDashboardQuerySchema = z.object({
  outletId: z.string().trim().min(1).optional(),
  salesPeriod: z.enum(PERIOD_VALUES).optional(),
  topSellingPeriod: z.enum(PERIOD_VALUES).optional(),
});
