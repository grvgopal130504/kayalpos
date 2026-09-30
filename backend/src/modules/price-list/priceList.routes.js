import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  priceListQuerySchema, createPriceListSchema, updatePriceListSchema,
} from './priceList.schema.js';
import {
  listPriceLists, getPriceListById, createPriceList, updatePriceList, deletePriceList,
} from './priceList.service.js';

// Masters > Price List. Custom service module (not utils/crudFactory.js) —
// same reason as Selling Price: the list needs a self-relation join
// (basePriceList) and a computed itemCount aggregated from SellingPrice,
// neither of which the generic factory supports.
const router = Router();
router.use(requireAuth);

router.get('/', validateRequest(priceListQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { rows, meta } = await listPriceLists(req.user.tenantId, req.query);
    res.json({ success: true, data: rows, meta });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getPriceListById(req.user.tenantId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
});

router.post('/', validateRequest(createPriceListSchema), async (req, res, next) => {
  try {
    const row = await createPriceList(req.user.tenantId, req.body);
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validateRequest(updatePriceListSchema), async (req, res, next) => {
  try {
    const row = await updatePriceList(req.user.tenantId, req.params.id, req.body);
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deletePriceList(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
