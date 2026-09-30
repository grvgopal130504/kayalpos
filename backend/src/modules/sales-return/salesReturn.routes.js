import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { createSalesReturnSchema } from './salesReturn.schema.js';
import { nextReturnNoPreview, lookupOriginalInvoice, createSalesReturn } from './salesReturn.service.js';

const router = Router();
router.use(requireAuth);

// Live "SR-190926-00007"-style preview for the Sales Return screen's Return
// No. field — same idea as every other module's next-code preview.
router.get('/next-return-no', async (req, res, next) => {
  try {
    const returnNo = await nextReturnNoPreview(req.user.tenantId);
    res.json({ success: true, data: { returnNo } });
  } catch (err) { next(err); }
});

// "Find Original Invoice" — looks a real Sale up by its billNo and reports
// what's still eligible to be returned on each line. Placed before any
// '/:id'-shaped route so a bill number is never mistaken for one.
router.get('/lookup/:billNo', async (req, res, next) => {
  try {
    const invoice = await lookupOriginalInvoice(req.user.tenantId, req.params.billNo);
    res.json({ success: true, data: invoice });
  } catch (err) { next(err); }
});

router.post('/', validateRequest(createSalesReturnSchema), async (req, res, next) => {
  try {
    const row = await createSalesReturn(req.user.tenantId, req.body, req.user);
    res.status(201).json({ success: true, data: row });
  } catch (err) { next(err); }
});

export default router;
