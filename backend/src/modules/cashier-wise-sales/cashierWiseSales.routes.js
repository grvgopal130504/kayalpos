import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { cashierWiseSalesQuerySchema } from './cashierWiseSales.schema.js';
import { getCashierWiseSalesReport } from './cashierWiseSales.service.js';

const router = Router();
router.use(requireAuth);

// Feeds the Cashier Panel's Cashier Wise Sales report — stat tiles, Sales
// Summary, the Sales Contribution (By Cashier) donut, the paginated
// per-cashier details table, the Sales Trend (By Cashier) chart, and Top
// Performing Cashiers. Read only, same as every other report in this
// module: built directly from real Sale/SaleLine/SalesReturn rows (see
// cashierWiseSales.service.js's getCashierWiseSalesReport) rather than any
// separate table of its own.
router.get('/summary', validateRequest(cashierWiseSalesQuerySchema, 'query'), async (req, res, next) => {
  try {
    const report = await getCashierWiseSalesReport(req.user.tenantId, req.user.outletId, req.query);
    res.json({ success: true, data: report });
  } catch (err) {
    next(err);
  }
});

export default router;
