/**
 * Frontend-owned option list for the Employee master. `LOCATION_OPTIONS` no
 * longer lives here — the Location dropdown is now populated from the real
 * Outlet master (see api/outletApi.js). The actual employee rows come from
 * the real API (see api/employeeApi.js) — no static row data lives here
 * any more.
 */

export const EMPLOYEE_TYPE_OPTIONS = ['Cashier', 'Sales Employee'];

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];
