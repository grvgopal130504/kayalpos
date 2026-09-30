import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createStockCountSchema, updateStockCountSchema } from './stockCount.schema.js';
import {
  listStockCounts, getStockCount, createStockCount, updateStockCount,
  deleteStockCount, nextCodePreview, getStockCountSummary,
} from './stockCount.service.js';

const router = Router();
router.use(requireAuth);

// Live "CNT-00031"-style preview for the New Stock Count screen's disabled
// Count No. field — same idea as every other module's next-code preview.
router.get('/next-code', async (req, res, next) => {
  try {
    const code = await nextCodePreview(req.user.tenantId);
    res.json({ success: true, data: { code } });
  } catch (err) { next(err); }
});

// Feeds the Stock Count page's top 5-tile summary strip — see
// stockCount.service.js's getStockCountSummary.
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await getStockCountSummary(req.user.tenantId);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const rows = await listStockCounts(req.user.tenantId, req.query);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getStockCount(req.user.tenantId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.post('/', validateRequest(createStockCountSchema), async (req, res, next) => {
  try {
    const row = await createStockCount(req.user.tenantId, req.body, req.user);
    res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.put('/:id', validateRequest(updateStockCountSchema), async (req, res, next) => {
  try {
    const row = await updateStockCount(req.user.tenantId, req.params.id, req.body, req.user);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteStockCount(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
