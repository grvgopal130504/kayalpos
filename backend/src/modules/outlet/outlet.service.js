import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

// Unlike Company (a singleton per tenant), an Outlet is one row among many,
// so its Contact Person sub-resource is scoped by tenantId AND outletId —
// every call here re-verifies the outlet belongs to this tenant before
// touching its contacts, the same "never trust the client's outletId alone"
// rule every other module follows.

async function requireOutlet(tenantId, outletId) {
  const outlet = await prisma.outlet.findFirst({ where: { id: outletId, tenantId } });
  if (!outlet) throw new ApiError(404, 'Outlet not found');
  return outlet;
}

export async function addOutletContact(tenantId, outletId, data) {
  const outlet = await requireOutlet(tenantId, outletId);

  return prisma.$transaction(async (tx) => {
    if (data.isPrimary) {
      await tx.outletContact.updateMany({ where: { outletId: outlet.id }, data: { isPrimary: false } });
    }
    return tx.outletContact.create({ data: { ...data, outletId: outlet.id } });
  });
}

export async function updateOutletContact(tenantId, outletId, contactId, data) {
  const outlet = await requireOutlet(tenantId, outletId);
  const existing = await prisma.outletContact.findFirst({ where: { id: contactId, outletId: outlet.id } });
  if (!existing) throw new ApiError(404, 'Contact person not found');

  return prisma.$transaction(async (tx) => {
    if (data.isPrimary) {
      await tx.outletContact.updateMany({
        where: { outletId: outlet.id, id: { not: contactId } },
        data: { isPrimary: false },
      });
    }
    return tx.outletContact.update({ where: { id: contactId }, data });
  });
}

export async function deleteOutletContact(tenantId, outletId, contactId) {
  const outlet = await requireOutlet(tenantId, outletId);
  const existing = await prisma.outletContact.findFirst({ where: { id: contactId, outletId: outlet.id } });
  if (!existing) throw new ApiError(404, 'Contact person not found');

  await prisma.outletContact.delete({ where: { id: contactId } });
  return { id: contactId };
}
