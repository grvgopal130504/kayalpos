import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { DEV_USER } from '../../config/devAuth.js';
import { ApiError } from '../../middleware/errorHandler.js';

/**
 * Dev-only login: checks the single hardcoded credential in devAuth.js.
 * Replace this with a Prisma-backed lookup + bcrypt.compare once the User
 * table and real authentication are implemented.
 */
export function login({ username, password, outletId }) {
  const isValid = username === DEV_USER.username && password === DEV_USER.password;

  if (!isValid) {
    throw new ApiError(401, 'Invalid username or password');
  }

  const user = {
    id: DEV_USER.id,
    username: DEV_USER.username,
    name: DEV_USER.name,
    role: DEV_USER.role,
    outletId,
  };

  const token = jwt.sign(user, env.JWT_SECRET, { expiresIn: '12h' });

  return { user, token };
}

/**
 * Dev-only password change: verifies the current password against the same
 * hardcoded DEV_USER used by login(), then mutates it in memory — so the
 * new password is effective immediately but resets on server restart, same
 * caveat as the rest of devAuth.js. Replace with a Prisma-backed
 * bcrypt.compare + hash + update once the User table exists.
 */
export function changePassword({ username, currentPassword, newPassword }) {
  if (username !== DEV_USER.username) {
    throw new ApiError(401, 'Authentication required');
  }
  if (currentPassword !== DEV_USER.password) {
    throw new ApiError(400, 'Current password is incorrect');
  }

  DEV_USER.password = newPassword;

  return { success: true };
}
