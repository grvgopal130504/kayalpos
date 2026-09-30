import { prisma } from '../../config/prisma.js';
import { ApiError } from '../../middleware/errorHandler.js';

// Company is a singleton per tenant (tenantId is @unique on the model), so
// every one of these is a single findUnique/upsert by tenantId — never a
// list, never more than 1-2 queries per call, nowhere near the 5-connection
// pool cap every other module here has to batch/stagger around.

/** Returns this tenant's Company profile with its contacts, or null if the tenant hasn't set one up yet. */
export async function getCompanyProfile(tenantId) {
  return prisma.company.findUnique({
    where: { tenantId },
    include: { contacts: { orderBy: { createdAt: 'asc' } } },
  });
}

/**
 * Creates the profile on first save, updates it on every save after —
 * upsert on the tenantId unique key so the same "Save" button in the UI
 * covers both without a separate "set up my company" step.
 */
export async function saveCompanyProfile(tenantId, data) {
  return prisma.company.upsert({
    where: { tenantId },
    create: { tenantId, ...data },
    update: data,
    include: { contacts: { orderBy: { createdAt: 'asc' } } },
  });
}

async function requireCompany(tenantId) {
  const company = await prisma.company.findUnique({ where: { tenantId } });
  if (!company) throw new ApiError(404, 'Save the Company Details tab before adding contact persons');
  return company;
}

export async function addContactPerson(tenantId, data) {
  const company = await requireCompany(tenantId);

  return prisma.$transaction(async (tx) => {
    // Only one contact can be primary — clear any existing primary first so
    // marking a new one primary always demotes the old one, never leaves
    // two.
    if (data.isPrimary) {
      await tx.companyContact.updateMany({ where: { companyId: company.id }, data: { isPrimary: false } });
    }
    return tx.companyContact.create({ data: { ...data, companyId: company.id } });
  });
}

export async function updateContactPerson(tenantId, contactId, data) {
  const company = await requireCompany(tenantId);
  const existing = await prisma.companyContact.findFirst({ where: { id: contactId, companyId: company.id } });
  if (!existing) throw new ApiError(404, 'Contact person not found');

  return prisma.$transaction(async (tx) => {
    if (data.isPrimary) {
      await tx.companyContact.updateMany({
        where: { companyId: company.id, id: { not: contactId } },
        data: { isPrimary: false },
      });
    }
    return tx.companyContact.update({ where: { id: contactId }, data });
  });
}

export async function deleteContactPerson(tenantId, contactId) {
  const company = await requireCompany(tenantId);
  const existing = await prisma.companyContact.findFirst({ where: { id: contactId, companyId: company.id } });
  if (!existing) throw new ApiError(404, 'Contact person not found');

  await prisma.companyContact.delete({ where: { id: contactId } });
  return { id: contactId };
}
