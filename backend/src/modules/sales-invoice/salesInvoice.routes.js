import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createSalesInvoiceSchema, updateSalesInvoiceSchema } from './salesInvoice.schema.js';
import {
  listSalesInvoices, getSalesInvoice, createSalesInvoice, updateSalesInvoice,
  deleteSalesInvoice, nextCodePreview, getSalesInvoiceSummary, getSalesInvoiceStatusSummary,
} from './salesInvoice.service.js';

const router = Router();
router.use(requireAuth);

// Live "INV-00057"-style preview for the New Sales Invoice screen's disabled
// Invoice No. field — same idea as customer/product/sales-quotation/
// sales-order's own next-code preview.
router.get('/next-code', async (req, res, next) => {
  try {
    const code = await nextCodePreview(req.user.tenantId);
    res.json({ success: true, data: { code } });
  } catch (err) { next(err); }
});

// Feeds the Sales Invoice page's top 5-tile summary strip — see
// salesInvoice.service.js's getSalesInvoiceSummary.
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await getSalesInvoiceSummary(req.user.tenantId);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

// Feeds the Draft/Sent/Paid/Overdue status pages' 4-tile strip for one
// status at a time — see salesInvoice.service.js's
// getSalesInvoiceStatusSummary. Placed before '/:id' so 'status-summary' is
// never mistaken for an invoice id.
router.get('/status-summary/:status', async (req, res, next) => {
  try {
    const summary = await getSalesInvoiceStatusSummary(req.user.tenantId, req.params.status);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const rows = await listSalesInvoices(req.user.tenantId, req.query);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getSalesInvoice(req.user.tenantId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.post('/', validateRequest(createSalesInvoiceSchema), async (req, res, next) => {
  try {
    const row = await createSalesInvoice(req.user.tenantId, req.body, req.user);
    res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.put('/:id', validateRequest(updateSalesInvoiceSchema), async (req, res, next) => {
  try {
    const row = await updateSalesInvoice(req.user.tenantId, req.params.id, req.body, req.user);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteSalesInvoice(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
