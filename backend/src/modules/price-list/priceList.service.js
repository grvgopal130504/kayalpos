import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

const MAX_PAGE_SIZE = 200;
const CODE_PREFIX = 'PL';
const CODE_LENGTH = 3;

const BASE_PRICE_LIST_SELECT = { id: true, name: true };

/** Turns known Prisma error codes into friendly 4xx responses instead of a raw 500. */
function prismaKnownError(err) {
  if (err?.code === 'P2002') {
    return new ApiError(409, 'A price list with that code or name already exists', err.meta);
  }
  if (err?.code === 'P2003') {
    return new ApiError(409, 'The selected base price list no longer exists', err.meta);
  }
  return err;
}

/**
 * Next sequential code for a tenant (PL-001, PL-002, ...) — same count-based,
 * dash-separated convention as utils/crudFactory.js's nextCode() (e.g.
 * Brand's BR-0001), reimplemented here since this module doesn't use the
 * generic factory (it needs the self-relation include and the computed
 * itemCount the factory doesn't support). Matches the frontend's
 * useNextCodePreview() helper exactly so the Add dialog's live preview
 * always agrees with what actually gets saved.
 */
async function nextCode(tenantId) {
  const count = await prisma.priceList.count({ where: { tenantId } });
  return `${CODE_PREFIX}-${String(count + 1).padStart(CODE_LENGTH, '0')}`;
}

async function requireBasePriceListIfSet(tenantId, basePriceListId, selfId) {
  if (!basePriceListId) return null;
  if (selfId && basePriceListId === selfId) {
    throw new ApiError(400, 'A price list cannot be based on itself');
  }
  const base = await prisma.priceList.findFirst({ where: { id: basePriceListId, tenantId } });
  if (!base) throw new ApiError(404, 'Base price list not found');
  return base;
}

/**
 * Merges a real `itemCount` onto each row: the number of Selling Price
 * records currently pointing at that price list. There's no real foreign
 * key for this (SellingPrice.priceList is still free text — see its own
 * doc comment on schema.prisma for why no Price List relation exists there
 * yet), so it's a name match rather than a join: one groupBy query counts
 * every tenant's SellingPrice rows per `priceList` string, and each row
 * here looks up its own name in that map. A price list that's been renamed
 * since a SellingPrice row was saved against its old name will under-count
 * until this app links them for real — an accepted gap, not a goal.
 */
async function withItemCounts(tenantId, rows) {
  if (rows.length === 0) return rows;
  const names = rows.map((r) => r.name);
  const grouped = await prisma.sellingPrice.groupBy({
    by: ['priceList'],
    where: { tenantId, priceList: { in: names } },
    _count: { _all: true },
  });
  const countByName = new Map(grouped.map((g) => [g.priceList, g._count._all]));
  return rows.map((row) => ({ ...row, itemCount: countByName.get(row.name) || 0 }));
}

export async function listPriceLists(tenantId, query = {}) {
  const {
    search, type, applicableTo, status, page = 1, pageSize = 50,
  } = query;

  const where = { tenantId };
  if (status && status !== 'All') where.status = status;
  if (type) where.type = type;
  if (applicableTo) where.applicableTo = applicableTo;
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
  const size = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(pageSize, 10) || 50));

  const [rows, total] = await Promise.all([
    prisma.priceList.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (pageNum - 1) * size,
      take: size,
      include: { basePriceList: { select: BASE_PRICE_LIST_SELECT } },
    }),
    prisma.priceList.count({ where }),
  ]);

  const rowsWithCounts = await withItemCounts(tenantId, rows);

  return {
    rows: rowsWithCounts,
    meta: {
      page: pageNum,
      pageSize: size,
      total,
      totalPages: Math.max(1, Math.ceil(total / size)),
      stats: await getPriceListStats(tenantId),
    },
  };
}

/**
 * Powers the four stat tiles at the bottom of the Price List page — always
 * tenant-wide totals, independent of the current search/filter/page (same
 * "stat tiles are all-time, the table is filtered" convention as Product's
 * page and every cashier-panel report here).
 */
export async function getPriceListStats(tenantId) {
  const [total, active, allNames] = await Promise.all([
    prisma.priceList.count({ where: { tenantId } }),
    prisma.priceList.count({ where: { tenantId, status: 'ACTIVE' } }),
    prisma.priceList.findMany({ where: { tenantId }, select: { name: true } }),
  ]);

  const totalItemsInPriceLists = await prisma.sellingPrice.count({
    where: { tenantId, priceList: { in: allNames.map((n) => n.name) } },
  });

  return {
    totalPriceLists: total,
    activePriceLists: active,
    inactivePriceLists: total - active,
    totalItemsInPriceLists,
  };
}

export async function getPriceListById(tenantId, id) {
  const row = await prisma.priceList.findFirst({
    where: { id, tenantId },
    include: { basePriceList: { select: BASE_PRICE_LIST_SELECT } },
  });
  if (!row) throw new ApiError(404, 'Price list not found');
  const [withCount] = await withItemCounts(tenantId, [row]);
  return withCount;
}

export async function createPriceList(tenantId, data) {
  await requireBasePriceListIfSet(tenantId, data.basePriceListId, null);

  const code = data.code || await nextCode(tenantId);

  return prisma.priceList.create({
    data: {
      tenantId,
      code,
      name: data.name.trim(),
      type: data.type,
      applicableTo: data.applicableTo,
      basePriceListId: data.basePriceListId || null,
      currency: data.currency,
      effectiveFrom: data.effectiveFrom || null,
      effectiveTo: data.effectiveTo || null,
      status: data.status,
    },
    include: { basePriceList: { select: BASE_PRICE_LIST_SELECT } },
  }).catch((err) => { throw prismaKnownError(err); });
}

export async function updatePriceList(tenantId, id, data) {
  const existing = await prisma.priceList.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Price list not found');

  if (data.basePriceListId !== undefined && data.basePriceListId !== existing.basePriceListId) {
    await requireBasePriceListIfSet(tenantId, data.basePriceListId, id);
  }

  return prisma.priceList.update({
    where: { id },
    data: {
      code: data.code ?? undefined,
      name: data.name !== undefined ? data.name.trim() : undefined,
      type: data.type ?? undefined,
      applicableTo: data.applicableTo ?? undefined,
      basePriceListId: data.basePriceListId !== undefined ? (data.basePriceListId || null) : undefined,
      currency: data.currency ?? undefined,
      effectiveFrom: data.effectiveFrom !== undefined ? (data.effectiveFrom || null) : undefined,
      effectiveTo: data.effectiveTo !== undefined ? (data.effectiveTo || null) : undefined,
      status: data.status ?? undefined,
    },
    include: { basePriceList: { select: BASE_PRICE_LIST_SELECT } },
  }).catch((err) => { throw prismaKnownError(err); });
}

export async function deletePriceList(tenantId, id) {
  const existing = await prisma.priceList.findFirst({ where: { id, tenantId } });
  if (!existing) throw new ApiError(404, 'Price list not found');

  await prisma.priceList.delete({ where: { id } });
  return { id };
}
