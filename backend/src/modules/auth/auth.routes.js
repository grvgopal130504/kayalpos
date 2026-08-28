import { Router } from 'express';
import { validateRequest } from '../../middleware/validateRequest.js';
import { loginSchema } from './auth.schema.js';
import { loginHandler } from './auth.controller.js';

const router = Router();

router.post('/login', validateRequest(loginSchema), loginHandler);

export default router;
