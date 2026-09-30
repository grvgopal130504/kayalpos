import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createStockWastageSchema, updateStockWastageSchema } from './stockWastage.schema.js';
import {
  listStockWastages, getStockWastage, createStockWastage, updateStockWastage,
  deleteStockWastage, nextCodePreview, getStockWastageSummary,
} from './stockWastage.service.js';

const router = Router();
router.use(requireAuth);

// Live "WST-00031"-style preview for the New Stock Wastage screen's disabled
// Wastage No. field — same idea as every other module's next-code preview.
router.get('/next-code', async (req, res, next) => {
  try {
    const code = await nextCodePreview(req.user.tenantId);
    res.json({ success: true, data: { code } });
  } catch (err) { next(err); }
});

// Feeds the Stock Wastage page's top 5-tile summary strip — see
// stockWastage.service.js's getStockWastageSummary.
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await getStockWastageSummary(req.user.tenantId);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const rows = await listStockWastages(req.user.tenantId, req.query);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getStockWastage(req.user.tenantId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.post('/', validateRequest(createStockWastageSchema), async (req, res, next) => {
  try {
    const row = await createStockWastage(req.user.tenantId, req.body, req.user);
    res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.put('/:id', validateRequest(updateStockWastageSchema), async (req, res, next) => {
  try {
    const row = await updateStockWastage(req.user.tenantId, req.params.id, req.body, req.user);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteStockWastage(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
