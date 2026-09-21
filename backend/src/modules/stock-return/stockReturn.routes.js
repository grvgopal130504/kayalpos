import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createStockReturnSchema, updateStockReturnSchema } from './stockReturn.schema.js';
import {
  listStockReturns, getStockReturn, createStockReturn, updateStockReturn,
  deleteStockReturn, nextCodePreview, getStockReturnSummary,
} from './stockReturn.service.js';

const router = Router();
router.use(requireAuth);

// Live "RRT-00031"-style preview for the New Stock Return screen's disabled
// Return No. field — same idea as every other module's next-code preview.
router.get('/next-code', async (req, res, next) => {
  try {
    const code = await nextCodePreview(req.user.tenantId);
    res.json({ success: true, data: { code } });
  } catch (err) { next(err); }
});

// Feeds the Stock Return page's top 5-tile summary strip — see
// stockReturn.service.js's getStockReturnSummary.
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await getStockReturnSummary(req.user.tenantId);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const rows = await listStockReturns(req.user.tenantId, req.query);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getStockReturn(req.user.tenantId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.post('/', validateRequest(createStockReturnSchema), async (req, res, next) => {
  try {
    const row = await createStockReturn(req.user.tenantId, req.body, req.user);
    res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.put('/:id', validateRequest(updateStockReturnSchema), async (req, res, next) => {
  try {
    const row = await updateStockReturn(req.user.tenantId, req.params.id, req.body, req.user);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteStockReturn(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
