import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createSalesQuotationSchema, updateSalesQuotationSchema } from './salesQuotation.schema.js';
import {
  listSalesQuotations, getSalesQuotation, createSalesQuotation, updateSalesQuotation,
  deleteSalesQuotation, nextCodePreview, getSalesQuotationSummary, getSalesQuotationStatusSummary,
} from './salesQuotation.service.js';

const router = Router();
router.use(requireAuth);

// Live "QUO-00087"-style preview for the New Quotation screen's disabled
// Quotation No. field — same idea as customer/product/gift-voucher's own
// next-code preview.
router.get('/next-code', async (req, res, next) => {
  try {
    const code = await nextCodePreview(req.user.tenantId);
    res.json({ success: true, data: { code } });
  } catch (err) { next(err); }
});

// Feeds the Sales Quotation page's top 5-tile summary strip — see
// salesQuotation.service.js's getSalesQuotationSummary.
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await getSalesQuotationSummary(req.user.tenantId);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

// Feeds the Draft/Converted/Expired status pages' 4-tile strip for one
// status at a time — see salesQuotation.service.js's
// getSalesQuotationStatusSummary. Placed before '/:id' so 'status-summary'
// is never mistaken for a quotation id.
router.get('/status-summary/:status', async (req, res, next) => {
  try {
    const summary = await getSalesQuotationStatusSummary(req.user.tenantId, req.params.status);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const rows = await listSalesQuotations(req.user.tenantId, req.query);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getSalesQuotation(req.user.tenantId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.post('/', validateRequest(createSalesQuotationSchema), async (req, res, next) => {
  try {
    const row = await createSalesQuotation(req.user.tenantId, req.body, req.user);
    res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.put('/:id', validateRequest(updateSalesQuotationSchema), async (req, res, next) => {
  try {
    const row = await updateSalesQuotation(req.user.tenantId, req.params.id, req.body, req.user);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteSalesQuotation(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
