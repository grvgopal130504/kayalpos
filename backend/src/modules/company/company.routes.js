import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validateRequest.js';
import { companyProfileSchema, companyContactSchema, updateCompanyContactSchema } from './company.schema.js';
import {
  getCompanyProfile, saveCompanyProfile, addContactPerson, updateContactPerson, deleteContactPerson,
} from './company.service.js';

const router = Router();
router.use(requireAuth);

// GET /api/company — the Company Details tab's data. Returns `data: null`
// (not a 404) when the tenant hasn't saved a company profile yet, so the
// frontend can render an empty, editable form instead of treating "not set
// up yet" as an error.
router.get('/', async (req, res, next) => {
  try {
    const company = await getCompanyProfile(req.user.tenantId);
    res.json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
});

// PUT /api/company — upsert. Same route creates the profile the first time
// and updates it on every save after (see company.service.js's upsert).
router.put('/', validateRequest(companyProfileSchema), async (req, res, next) => {
  try {
    const company = await saveCompanyProfile(req.user.tenantId, req.body);
    res.json({ success: true, data: company });
  } catch (err) {
    next(err);
  }
});

router.post('/contacts', validateRequest(companyContactSchema), async (req, res, next) => {
  try {
    const contact = await addContactPerson(req.user.tenantId, req.body);
    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

router.put('/contacts/:id', validateRequest(updateCompanyContactSchema), async (req, res, next) => {
  try {
    const contact = await updateContactPerson(req.user.tenantId, req.params.id, req.body);
    res.json({ success: true, data: contact });
  } catch (err) {
    next(err);
  }
});

router.delete('/contacts/:id', async (req, res, next) => {
  try {
    const result = await deleteContactPerson(req.user.tenantId, req.params.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
