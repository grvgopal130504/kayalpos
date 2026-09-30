import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

// Warehouse's Contact Person sub-resource — same tenantId + parentId
// double-check as Outlet's own contacts (see outlet.service.js): every call
// here re-verifies the warehouse belongs to this tenant before touching its
// contacts, so a warehouseId from one tenant can never be used to read or
// write another tenant's contact rows.

async function requireWarehouse(tenantId, warehouseId) {
  const warehouse = await prisma.warehouse.findFirst({ where: { id: warehouseId, tenantId } });
  if (!warehouse) throw new ApiError(404, 'Warehouse not found');
  return warehouse;
}

export async function addWarehouseContact(tenantId, warehouseId, data) {
  const warehouse = await requireWarehouse(tenantId, warehouseId);

  return prisma.$transaction(async (tx) => {
    if (data.isPrimary) {
      await tx.warehouseContact.updateMany({ where: { warehouseId: warehouse.id }, data: { isPrimary: false } });
    }
    return tx.warehouseContact.create({ data: { ...data, warehouseId: warehouse.id } });
  });
}

export async function updateWarehouseContact(tenantId, warehouseId, contactId, data) {
  const warehouse = await requireWarehouse(tenantId, warehouseId);
  const existing = await prisma.warehouseContact.findFirst({ where: { id: contactId, warehouseId: warehouse.id } });
  if (!existing) throw new ApiError(404, 'Contact person not found');

  return prisma.$transaction(async (tx) => {
    if (data.isPrimary) {
      await tx.warehouseContact.updateMany({
        where: { warehouseId: warehouse.id, id: { not: contactId } },
        data: { isPrimary: false },
      });
    }
    return tx.warehouseContact.update({ where: { id: contactId }, data });
  });
}

export async function deleteWarehouseContact(tenantId, warehouseId, contactId) {
  const warehouse = await requireWarehouse(tenantId, warehouseId);
  const existing = await prisma.warehouseContact.findFirst({ where: { id: contactId, warehouseId: warehouse.id } });
  if (!existing) throw new ApiError(404, 'Contact person not found');

  await prisma.warehouseContact.delete({ where: { id: contactId } });
  return { id: contactId };
}
