import { prisma } from '../../config/prisma.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import { createCustomerSchema, updateCustomerSchema } from './customer.schema.js';

const router = createCrudRouter({
  model: prisma.customer,
  createSchema: createCustomerSchema,
  updateSchema: updateCustomerSchema,
  searchFields: ['code', 'name', 'mobile', 'email'],
  codePrefix: 'CUS-',
  codeLength: 4,
});

export default router;
