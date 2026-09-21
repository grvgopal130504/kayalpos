import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createPromotionSchema, updatePromotionSchema } from './promotion.schema.js';
import {
  listPromotions, getPromotion, createPromotion, updatePromotion, deletePromotion, nextCodePreview,
} from './promotion.service.js';

const router = Router();
router.use(requireAuth);

router.get('/next-code', async (req, res, next) => {
  try {
    const code = await nextCodePreview(req.user.tenantId);
    res.json({ success: true, data: { code } });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const rows = await listPromotions(req.user.tenantId, req.query);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getPromotion(req.user.tenantId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.post('/', validateRequest(createPromotionSchema), async (req, res, next) => {
  try {
    const row = await createPromotion(req.user.tenantId, req.body);
    res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.put('/:id', validateRequest(updatePromotionSchema), async (req, res, next) => {
  try {
    const row = await updatePromotion(req.user.tenantId, req.params.id, req.body);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deletePromotion(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
