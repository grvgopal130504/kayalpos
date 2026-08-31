import { Router } from 'express';
import { getHealthHandler } from './health.controller.js';

const router = Router();

// No requireAuth: health checks must be reachable without a session so
// uptime monitors and the frontend's status tag can hit this before login.
router.get('/', getHealthHandler);

export default router;
