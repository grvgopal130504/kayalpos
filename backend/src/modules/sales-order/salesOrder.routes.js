import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createSalesOrderSchema, updateSalesOrderSchema } from './salesOrder.schema.js';
import {
  listSalesOrders, getSalesOrder, createSalesOrder, updateSalesOrder,
  deleteSalesOrder, nextCodePreview, getSalesOrderSummary, getSalesOrderStatusSummary,
} from './salesOrder.service.js';

const router = Router();
router.use(requireAuth);

// Live "SO-00046"-style preview for the New Sales Order screen's disabled
// Order No. field — same idea as customer/product/sales-quotation's own
// next-code preview.
router.get('/next-code', async (req, res, next) => {
  try {
    const code = await nextCodePreview(req.user.tenantId);
    res.json({ success: true, data: { code } });
  } catch (err) { next(err); }
});

// Feeds the Sales Order page's top 5-tile summary strip — see
// salesOrder.service.js's getSalesOrderSummary.
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await getSalesOrderSummary(req.user.tenantId);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

// Feeds the Pending/Confirmed/Delivered status pages' 4-tile strip for one
// status at a time — see salesOrder.service.js's getSalesOrderStatusSummary.
// Placed before '/:id' so 'status-summary' is never mistaken for an order id.
router.get('/status-summary/:status', async (req, res, next) => {
  try {
    const summary = await getSalesOrderStatusSummary(req.user.tenantId, req.params.status);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const rows = await listSalesOrders(req.user.tenantId, req.query);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getSalesOrder(req.user.tenantId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.post('/', validateRequest(createSalesOrderSchema), async (req, res, next) => {
  try {
    const row = await createSalesOrder(req.user.tenantId, req.body, req.user);
    res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.put('/:id', validateRequest(updateSalesOrderSchema), async (req, res, next) => {
  try {
    const row = await updateSalesOrder(req.user.tenantId, req.params.id, req.body, req.user);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteSalesOrder(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
