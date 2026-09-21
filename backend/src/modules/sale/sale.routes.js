import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createSaleSchema } from './sale.schema.js';
import {
  createSale, nextBillNo, getDiscountSummary,
  getSalesOverviewSummary, getCustomerPurchaseSummaries, getCustomerPurchaseSummary,
} from './sale.service.js';

const router = Router();
router.use(requireAuth);

// Live "LS-00001"-style preview for the Line Sale screen's Bill No. field,
// same idea as customer/product's next-code preview.
router.get('/next-bill-no', async (req, res, next) => {
  try {
    const billNo = await nextBillNo(req.user.tenantId);
    res.json({ success: true, data: { billNo } });
  } catch (err) {
    next(err);
  }
});

// Feeds the Promotion page's "Discount Trend" and "Discount by Outlet"
// cards — see sale.service.js's getDiscountSummary for exactly what this
// does and doesn't represent.
router.get('/discount-summary', async (req, res, next) => {
  try {
    const summary = await getDiscountSummary(req.user.tenantId);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// Feeds the Customer page's top "Total Sales (This Month)"/"Outstanding
// Amount" tiles — see sale.service.js's getSalesOverviewSummary.
router.get('/overview-summary', async (req, res, next) => {
  try {
    const summary = await getSalesOverviewSummary(req.user.tenantId);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// Feeds the Customer list table's per-row Total Purchase/Outstanding
// columns in one query — see sale.service.js's getCustomerPurchaseSummaries.
router.get('/customer-summaries', async (req, res, next) => {
  try {
    const summaries = await getCustomerPurchaseSummaries(req.user.tenantId);
    res.json({ success: true, data: summaries });
  } catch (err) {
    next(err);
  }
});

// Feeds the Customer detail panel/view page's Total Purchase/Outstanding
// figures and its real Recent Transactions list — see sale.service.js's
// getCustomerPurchaseSummary.
router.get('/customer/:customerId', async (req, res, next) => {
  try {
    const summary = await getCustomerPurchaseSummary(req.user.tenantId, req.params.customerId);
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
});

// Creates and immediately settles a Line Sale bill — see sale.service.js's
// createSale for the stock check + totals math, all done server-side inside
// one transaction. `outletId` comes from the cashier's own JWT (the outlet
// they logged into), never from the request body, so it can't be spoofed.
router.post('/', validateRequest(createSaleSchema), async (req, res, next) => {
  try {
    const sale = await createSale({ tenantId: req.user.tenantId, outletId: req.user.outletId, ...req.body });
    res.status(201).json({ success: true, data: sale });
  } catch (err) {
    next(err);
  }
});

export default router;
