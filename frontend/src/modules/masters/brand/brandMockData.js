/**
 * Static config for the Brand master (not transactional data — safe to
 * keep as a plain constant, unlike the row/stat data that used to live
 * here). Actual brand records now come from the real API (see
 * api/brandApi.js), wired in BrandPage.jsx.
 */
export const CATEGORY_OPTIONS = ['Grocery', 'Beverages', 'Biscuits & Snacks', 'Personal Care', 'Dairy', 'Noodles & Pasta'];
