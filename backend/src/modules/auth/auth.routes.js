import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { requireAuth } from '../../middleware/auth.js';
import { loginSchema, changePasswordSchema } from './auth.schema.js';
import { loginHandler, changePasswordHandler } from './auth.controller.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), loginHandler);
router.post('/change-password', requireAuth, validateRequest(changePasswordSchema), changePasswordHandler);

export default router;
