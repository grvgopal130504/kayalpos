/**
 * DEPRECATED — no longer used.
 * -------------------------------------------------------------------------
 * Real, Prisma-backed authentication (User table + bcrypt password hashes)
 * now lives in modules/auth/auth.service.js. This file is kept only so the
 * diff is easy to review; it is safe to delete this file.
 */
export const DEV_USER = {
  id: 'dev-super-admin',
  username: 'admin',
  password: 'Admin@123',
  name: 'Admin',
  role: 'SUPER_ADMIN',
};
