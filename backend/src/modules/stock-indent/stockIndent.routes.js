import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createStockIndentSchema, updateStockIndentSchema } from './stockIndent.schema.js';
import {
  listStockIndents, getStockIndent, createStockIndent, updateStockIndent,
  deleteStockIndent, nextCodePreview, getStockIndentSummary, getStockIndentStatusSummary,
} from './stockIndent.service.js';

const router = Router();
router.use(requireAuth);

// Live "IND-00039"-style preview for the New Stock Indent screen's disabled
// Indent No. field — same idea as every other module's next-code preview.
router.get('/next-code', async (req, res, next) => {
  try {
    const code = await nextCodePreview(req.user.tenantId);
    res.json({ success: true, data: { code } });
  } catch (err) { next(err); }
});

// Feeds the Stock Indent page's top 5-tile summary strip — see
// stockIndent.service.js's getStockIndentSummary.
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await getStockIndentSummary(req.user.tenantId);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

// Feeds the Draft/Pending Approval/Approved/Rejected status pages' 4-tile
// strip for one status at a time — see stockIndent.service.js's
// getStockIndentStatusSummary. Placed before '/:id' so 'status-summary' is
// never mistaken for an indent id.
router.get('/status-summary/:status', async (req, res, next) => {
  try {
    const summary = await getStockIndentStatusSummary(req.user.tenantId, req.params.status);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const rows = await listStockIndents(req.user.tenantId, req.query);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getStockIndent(req.user.tenantId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.post('/', validateRequest(createStockIndentSchema), async (req, res, next) => {
  try {
    const row = await createStockIndent(req.user.tenantId, req.body, req.user);
    res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.put('/:id', validateRequest(updateStockIndentSchema), async (req, res, next) => {
  try {
    const row = await updateStockIndent(req.user.tenantId, req.params.id, req.body, req.user);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteStockIndent(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
