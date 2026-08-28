/**
 * TEMPORARY DEVELOPMENT AUTHENTICATION
 * -------------------------------------------------------------------------
 * This is a placeholder credential store used only until PostgreSQL is
 * connected and a real User table + password hashing (bcrypt) + role model
 * is implemented. It intentionally lives in its own file so it is easy to
 * find and delete when real authentication replaces it.
 *
 * Do NOT add more users here. Do NOT use this pattern in production.
 */
export const DEV_USER = {
  id: 'dev-super-admin',
  username: 'admin',
  password: 'Admin@123', // plain-text on purpose: dev-only stand-in, never used once DB auth lands
  name: 'Admin',
  role: 'SUPER_ADMIN',
};
