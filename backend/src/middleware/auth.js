import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from './errorHandler.js';

/**
 * Verifies the Bearer token issued at login and attaches the decoded user
 * to req.user. Any route that shouldn't be publicly readable should use
 * this — dashboard data included, since it's business data, not a public
 * marketing page.
 */
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return next(new ApiError(401, 'Authentication required'));
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET);
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired session'));
  }
}
