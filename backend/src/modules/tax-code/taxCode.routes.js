import { prisma } from '../../config/prisma.js';
import { createCrudRouter } from '../../utils/crudFactory.js';
import { createTaxCodeSchema, updateTaxCodeSchema } from './taxCode.schema.js';

const router = createCrudRouter({
  model: prisma.taxCode,
  createSchema: createTaxCodeSchema,
  updateSchema: updateTaxCodeSchema,
  searchFields: ['code', 'name'],
  codePrefix: 'TAX',
});

export default router;
