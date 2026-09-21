import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createStockTransferSchema, updateStockTransferSchema } from './stockTransfer.schema.js';
import {
  listStockTransfers, getStockTransfer, createStockTransfer, updateStockTransfer,
  deleteStockTransfer, nextCodePreview, getStockTransferSummary, getStockTransferStatusSummary,
} from './stockTransfer.service.js';

const router = Router();
router.use(requireAuth);

// Live "TRF-00039"-style preview for the New Stock Transfer screen's
// disabled Transfer No. field — same idea as every other module's
// next-code preview.
router.get('/next-code', async (req, res, next) => {
  try {
    const code = await nextCodePreview(req.user.tenantId);
    res.json({ success: true, data: { code } });
  } catch (err) { next(err); }
});

// Feeds the Stock Transfer page's top 5-tile summary strip — see
// stockTransfer.service.js's getStockTransferSummary.
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await getStockTransferSummary(req.user.tenantId);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

// Feeds the Draft/In Transit/Received/Cancelled status pages' 4-tile strip
// for one status at a time — see stockTransfer.service.js's
// getStockTransferStatusSummary. Placed before '/:id' so 'status-summary'
// is never mistaken for a transfer id.
router.get('/status-summary/:status', async (req, res, next) => {
  try {
    const summary = await getStockTransferStatusSummary(req.user.tenantId, req.params.status);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const rows = await listStockTransfers(req.user.tenantId, req.query);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getStockTransfer(req.user.tenantId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.post('/', validateRequest(createStockTransferSchema), async (req, res, next) => {
  try {
    const row = await createStockTransfer(req.user.tenantId, req.body, req.user);
    res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.put('/:id', validateRequest(updateStockTransferSchema), async (req, res, next) => {
  try {
    const row = await updateStockTransfer(req.user.tenantId, req.params.id, req.body, req.user);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteStockTransfer(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
