import { prisma } from '../../config/prisma.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import { createCustomerSchema, updateCustomerSchema } from './customer.schema.js';

const router = createCrudRouter({
  model: prisma.customer,
  createSchema: createCustomerSchema,
  updateSchema: updateCustomerSchema,
  searchFields: ['code', 'name', 'mobile', 'email'],
  // crudFactory's nextCode() inserts the dash itself (PREFIX-NNNN) — pass the
  // bare prefix so this doesn't come out as "CUS--0001".
  codePrefix: 'CUS',
});

export default router;
