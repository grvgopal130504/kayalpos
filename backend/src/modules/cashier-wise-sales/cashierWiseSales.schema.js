import { z } from 'zod';

// Query params for the Cashier Wise Sales report (GET /cashier-wise-sales/
// summary). `date` scopes the Sales Summary / Sales Contribution donut /
// per-cashier details table / Sales Trend chart to one calendar day
// (defaults to today in the service when omitted); the "Total Sales (All
// Cashiers)"/"Total Invoices" stat tiles are always all-time for the
// outlet, regardless of `date` — same convention as every other cashier-
// panel report's query schema. `page`/`pageSize` paginate the per-cashier
// details table only (sorted by that day's total sales, highest first) —
// there's no per-transaction list on this report, so it isn't the same
// kind of pagination as e.g. cashSalesQuerySchema's transactions list.
export const cashierWiseSalesQuerySchema = z.object({
  date: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
  page: z.coerce.number().int('Page must be a whole number').positive('Page must be at least 1').default(1),
  pageSize: z.coerce.number().int('Page size must be a whole number').positive('Page size must be at least 1')
    .max(100, 'Page size cannot exceed 100').default(10),
});
