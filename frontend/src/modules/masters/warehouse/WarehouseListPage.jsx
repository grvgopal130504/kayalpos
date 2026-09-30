// This file is intentionally retired. Warehouse's list, add, edit and view
// screens all now live in one place — WarehousePage.jsx (`/masters/warehouse`,
// internal `view: 'list' | 'detail'` state) — the same single-page pattern as
// Outlet/Company. This file used to be a separate list-only page whose
// "New Warehouse"/View/Edit actions navigated to `/masters/warehouse/new` and
// `/masters/warehouse/:id`, routes that no longer exist in App.jsx.
//
// It is kept only as a re-export (rather than deleted) so that if any stale
// bundler/HMR cache still resolves an old reference to this path, it renders
// the real, current WarehousePage instead of dead code with broken
// `navigate()` calls that used to point at removed routes and could open a
// stray tab. Do not add real content back here — edit WarehousePage.jsx.
export { default } from './WarehousePage';
