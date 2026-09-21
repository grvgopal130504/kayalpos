import { prisma } from '../../config/prisma.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import { createSupplierSchema, updateSupplierSchema } from './supplier.schema.js';

const router = createCrudRouter({
  model: prisma.supplier,
  createSchema: createSupplierSchema,
  updateSchema: updateSupplierSchema,
  searchFields: ['code', 'name', 'email', 'phone'],
  codePrefix: 'SUPP',
});

export default router;
