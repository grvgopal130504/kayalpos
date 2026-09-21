import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createGiftVoucherSchema, updateGiftVoucherSchema } from './giftVoucher.schema.js';
import {
  listGiftVouchers, getGiftVoucher, createGiftVoucher, updateGiftVoucher, deleteGiftVoucher, nextCodePreview,
} from './giftVoucher.service.js';

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
    const rows = await listGiftVouchers(req.user.tenantId, req.query);
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getGiftVoucher(req.user.tenantId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.post('/', validateRequest(createGiftVoucherSchema), async (req, res, next) => {
  try {
    const row = await createGiftVoucher(req.user.tenantId, req.body);
    res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.put('/:id', validateRequest(updateGiftVoucherSchema), async (req, res, next) => {
  try {
    const row = await updateGiftVoucher(req.user.tenantId, req.params.id, req.body);
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteGiftVoucher(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

export default router;
