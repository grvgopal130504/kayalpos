import { Router } from 'express';
import { prisma } from '../../config/prisma.js';
import { requireAuth } from '../../middleware/auth.js';
import { ApiError } from '../../middleware/errorHandler.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import { createCustomerSchema, updateCustomerSchema } from './customer.schema.js';
import { WALKIN_CUSTOMER_CODE } from './customer.service.js';

const crud = createCrudRouter({
  model: prisma.customer,
  createSchema: createCustomerSchema,
  updateSchema: updateCustomerSchema,
  searchFields: ['code', 'name', 'mobile', 'email'],
  // crudFactory's nextCode() inserts the dash itself (PREFIX-NNNN) — pass the
  // bare prefix so this doesn't come out as "CUS--0001".
  codePrefix: 'CUS',
});

const router = Router();
router.use(requireAuth);

// Duplicate-mobile guard for new customers, added for the Line Sale "Add
// Customer" dialog (quick registration mid-sale) where a cashier is more
// likely to accidentally re-enter an existing customer than on the full
// Customer master form. There was no such check before — Customer.mobile
// isn't DB-unique (only (tenantId, code) is) — so this is a new, scoped
// business rule rather than an existing one being enforced; it only blocks
// an exact mobile match within the same tenant, and ignores the tenant's own
// reserved Walk-in Customer row (whose mobile is a shared placeholder, not a
// real customer's number). Registered here ahead of the generic CRUD
// router's own POST / so it runs first; validateRequest inside `crud` still
// handles schema/shape validation as before.
router.post('/', async (req, res, next) => {
  try {
    const mobile = String(req.body?.mobile || '').trim();
    if (mobile) {
      const duplicate = await prisma.customer.findFirst({
        where: { tenantId: req.user.tenantId, mobile, code: { not: WALKIN_CUSTOMER_CODE } },
        select: { name: true, code: true },
      });
      if (duplicate) {
        throw new ApiError(409, `A customer with this mobile number already exists (${duplicate.name} — ${duplicate.code})`);
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

router.use(crud);

export default router;
