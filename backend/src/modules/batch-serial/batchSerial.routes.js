import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import {
  batchSerialQuerySchema, createBatchSerialSchema, updateBatchSerialSchema,
} from './batchSerial.schema.js';
import {
  listBatchSerials, getBatchSerialById, createBatchSerial, updateBatchSerial, deleteBatchSerial,
} from './batchSerial.service.js';

// Masters > Batch or Serial Number. Custom service module (not
// utils/crudFactory.js) — same reason as Selling Price/Price List: the list
// needs Product/Warehouse joins (for item code/name and warehouse name in
// the table) and the five bottom stat tiles need a tenant-wide aggregate the
// generic factory doesn't support.
const router = Router();
router.use(requireAuth);

router.get('/', validateRequest(batchSerialQuerySchema, 'query'), async (req, res, next) => {
  try {
    const { rows, meta } = await listBatchSerials(req.user.tenantId, req.query);
    res.json({ success: true, data: rows, meta });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const row = await getBatchSerialById(req.user.tenantId, req.params.id);
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
});

router.post('/', validateRequest(createBatchSerialSchema), async (req, res, next) => {
  try {
    const row = await createBatchSerial(req.user.tenantId, req.body);
    res.status(201).json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', validateRequest(updateBatchSerialSchema), async (req, res, next) => {
  try {
    const row = await updateBatchSerial(req.user.tenantId, req.params.id, req.body);
    res.json({ success: true, data: row });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const result = await deleteBatchSerial(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
