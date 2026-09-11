import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Generic CRUD router factory over a Prisma delegate (e.g. prisma.brand).
 * Every master-data module (Brand, Product, Supplier, Employee, ...) follows
 * the same tenant-scoped list/get/create/update/delete shape, so this one
 * factory replaces hand-written routes/controller/service boilerplate per
 * module. Modules with extra behavior (custom lookups, cross-entity writes)
 * can still add their own routes alongside — this only covers the common
 * 80%.
 *
 * Every route requires auth and every query/write is scoped to
 * req.user.tenantId, so one tenant can never read or mutate another
 * tenant's rows.
 *
 * @param {object} opts
 * @param {object} opts.model - a Prisma delegate, e.g. prisma.brand
 * @param {import('zod').ZodSchema} opts.createSchema
 * @param {import('zod').ZodSchema} opts.updateSchema
 * @param {string[]} [opts.searchFields] - string fields matched by ?search=
 * @param {object} [opts.orderBy] - default sort, e.g. { createdAt: 'desc' }
 * @param {string} [opts.codePrefix] - e.g. 'BR' to auto-generate BR001, BR002...
 * @param {string} [opts.codeField] - field name the generated code is written to (default 'code')
 */
export function createCrudRouter({
  model,
  createSchema,
  updateSchema,
  searchFields = [],
  orderBy = { createdAt: 'desc' },
  codePrefix,
  codeField = 'code',
}) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res, next) => {
    try {
      const { search, status } = req.query;
      const where = { tenantId: req.user.tenantId };

      if (status && status !== 'All') {
        where.status = String(status).toUpperCase();
      }
      if (search && searchFields.length) {
        where.OR = searchFields.map((field) => ({
          [field]: { contains: String(search), mode: 'insensitive' },
        }));
      }

      const rows = await model.findMany({ where, orderBy });
      res.json({ success: true, data: rows });
    } catch (err) {
      next(err);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const row = await model.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
      if (!row) throw new ApiError(404, 'Record not found');
      res.json({ success: true, data: row });
    } catch (err) {
      next(err);
    }
  });

  router.post('/', validateRequest(createSchema), async (req, res, next) => {
    try {
      const data = { ...req.body, tenantId: req.user.tenantId };

      if (codePrefix && !data[codeField]) {
        data[codeField] = await nextCode({ model, tenantId: req.user.tenantId, prefix: codePrefix });
      }

      const row = await model.create({ data });
      res.status(201).json({ success: true, data: row });
    } catch (err) {
      next(prismaKnownError(err));
    }
  });

  router.put('/:id', validateRequest(updateSchema), async (req, res, next) => {
    try {
      const existing = await model.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
      if (!existing) throw new ApiError(404, 'Record not found');

      const row = await model.update({ where: { id: req.params.id }, data: req.body });
      res.json({ success: true, data: row });
    } catch (err) {
      next(prismaKnownError(err));
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const existing = await model.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
      if (!existing) throw new ApiError(404, 'Record not found');

      await model.delete({ where: { id: req.params.id } });
      res.json({ success: true, data: { id: req.params.id } });
    } catch (err) {
      next(prismaKnownError(err));
    }
  });

  return router;
}

/**
 * Generates the next sequential code for a tenant (e.g. BR001, BR002, ...).
 * Uses a row count rather than a dedicated sequence table — good enough for
 * the current single-admin, low-concurrency dev/demo usage. If concurrent
 * writes ever become a real concern, replace this with a DocumentNumberSeries
 * table (already anticipated in the architecture proposal) guarded by a
 * transaction.
 */
async function nextCode({ model, tenantId, prefix }) {
  const count = await model.count({ where: { tenantId } });
  return `${prefix}${String(count + 1).padStart(3, '0')}`;
}

/** Turns a Prisma unique-constraint violation into a friendly 409 instead of a raw 500. */
function prismaKnownError(err) {
  if (err?.code === 'P2002') {
    return new ApiError(409, 'A record with that value already exists', err.meta);
  }
  return err;
}
