import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const MAX_PAGE_SIZE = 200;

const PRODUCT_SELECT = { id: true, code: true, name: true, uom: true };
const WAREHOUSE_SELECT = { id: true, code: true, name: true };

/** Turns known Prisma error codes into friendly 4xx responses instead of a raw 500. */
function prismaKnownError(err) {
  if (err?.code === 'P2002') {
    return new ApiError(409, 'A batch / serial record with that number already exists', err.meta);
  }
  if (err?.code === 'P2003') {
    return new ApiError(409, 'The selected item or warehouse no longer exists', err.meta);
  }
  return err;
}

async function requireProduct(tenantId, productId) {
  const product = await prisma.product.findFirst({ where: { id: productId, tenantId }, select: PRODUCT_SELECT });
  if (!product) throw new ApiError(404, 'Item not found');
  return product;
}

async function requireWarehouse(tenantId, warehouseId) {
  if (!warehouseId) return null;
  const warehouse = await prisma.warehouse.findFirst({ where: { id: warehouseId, tenantId }, select: WAREHOUSE_SELECT });
  if (!warehouse) throw new ApiError(404, 'Warehouse / outlet not found');
  return warehouse;
}

export async function listBatchSerials(tenantId, query = {}) {
  const {
    search, type, warehouseId, status, page = 1, pageSize = 50,
  } = query;

  const where = { tenantId };
  if (status && status !== 'All') where.status = status;
  if (type) where.type = type;
  if (warehouseId) where.warehouseId = warehouseId;
  if (search) {
    where.OR = [
      { number: { contains: search, mode: 'insensitive' } },
      { product: { code: { contains: search, mode: 'insensitive' } } },
      { product: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
  const size = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(pageSize, 10) || 50));

  const [rows, total] = await Promise.all([
    prisma.batchSerial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * size,
      take: size,
      include: { product: { select: PRODUCT_SELECT }, warehouse: { select: WAREHOUSE_SELECT } },
    }),
    prisma.batchSerial.count({ where }),
  ]);

  return {
    rows,
    meta: {
      page: pageNum,
      pageSize: size,
      total,
      totalPages: Math.max(1, Math.ceil(total / size)),
      stats: await getBatchSerialStats(tenantId),
    },
  };
}

/**
 * Powers the five stat tiles at the bottom of the Batch/Serial page — always
 * tenant-wide totals, independent of the current search/filter/page, same
 * "stat tiles are all-time, the table is filtered" convention as Price
 * List's/Product's own pages. `totalAvailableQty` only sums ACTIVE rows —
 * an inactive (e.g. recalled/deactivated) batch shouldn't count toward
 * on-hand stock the way the mock's STATS.totalAvailableQty implied.
 */
export async function getBatchSerialStats(tenantId) {
  const [totalBatches, totalSerials, distinctProducts, distinctWarehouses, activeQtyAgg] = await Promise.all([
    prisma.batchSerial.count({ where: { tenantId, type: 'BATCH' } }),
    prisma.batchSerial.count({ where: { tenantId, type: 'SERIAL' } }),
    prisma.batchSerial.findMany({ where: { tenantId }, select: { productId: true }, distinct: ['productId'] }),
    prisma.batchSerial.findMany({
      where: { tenantId, warehouseId: { not: null } }, select: { warehouseId: true }, distinct: ['warehouseId'],
    }),
    prisma.batchSerial.aggregate({ where: { tenantId, status: 'ACTIVE' }, _sum: { qty: true } }),
  ]);

  return {
    totalBatches,
    totalSerials,
    totalItemsTracked: distinctProducts.length,
    warehousesOutlets: distinctWarehouses.length,
    totalAvailableQty: Number(activeQtyAgg._sum.qty || 0),
  };
}

export async function getBatchSerialById(tenantId, id) {
  const row = await prisma.batchSerial.findFirst({
    where: { id, tenantId },
    include: { product: { select: PRODUCT_SELECT }, warehouse: { select: WAREHOUSE_SELECT } },
  });
  if (!row) throw new ApiError(404, 'Batch / serial record not found');
  return row;
}

export async function createBatchSerial(tenantId, data) {
  const product = await requireProduct(tenantId, data.productId);
  await requireWarehouse(tenantId, data.warehouseId);

  return prisma.batchSerial.create({
    data: {
      tenantId,
      productId: data.productId,
      number: data.number.trim(),
      type: data.type,
      mfgDate: data.mfgDate || null,
      expiryDate: data.type === 'SERIAL' ? null : (data.expiryDate || null),
      warehouseId: data.warehouseId || null,
      qty: data.qty,
      // Falls back to the selected Product's own uom when the client sends
      // none — see this field's doc comment in batchSerial.schema.js.
      uom: data.uom?.trim() || product.uom,
      status: data.status,
    },
    include: { product: { select: PRODUCT_SELECT }, warehouse: { select: WAREHOUSE_SELECT } },
  }).catch((err) => { throw prismaKnownError(err); });
}

export async function updateBatchSerial(tenantId, id, data) {
  const existing = await prisma.batchSerial.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Batch / serial record not found');

  let product = null;
  if (data.productId !== undefined && data.productId !== existing.productId) {
    product = await requireProduct(tenantId, data.productId);
  }
  if (data.warehouseId !== undefined && data.warehouseId !== existing.warehouseId) {
    await requireWarehouse(tenantId, data.warehouseId);
  }

  const nextType = data.type ?? existing.type;

  return prisma.batchSerial.update({
    where: { id },
    data: {
      productId: data.productId ?? undefined,
      number: data.number !== undefined ? data.number.trim() : undefined,
      type: data.type ?? undefined,
      mfgDate: data.mfgDate !== undefined ? (data.mfgDate || null) : undefined,
      expiryDate: nextType === 'SERIAL' ? null : (data.expiryDate !== undefined ? (data.expiryDate || null) : undefined),
      warehouseId: data.warehouseId !== undefined ? (data.warehouseId || null) : undefined,
      qty: data.qty !== undefined ? data.qty : undefined,
      uom: data.uom !== undefined ? (data.uom.trim() || product?.uom || existing.uom) : undefined,
      status: data.status ?? undefined,
    },
    include: { product: { select: PRODUCT_SELECT }, warehouse: { select: WAREHOUSE_SELECT } },
  }).catch((err) => { throw prismaKnownError(err); });
}

export async function deleteBatchSerial(tenantId, id) {
  const existing = await prisma.batchSerial.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Batch / serial record not found');

  await prisma.batchSerial.delete({ where: { id } });
  return { id };
}
