/**
 * Frontend-owned option list for the Batch / Serial Number master.
 * `WAREHOUSE_OPTIONS` no longer lives here — the Warehouse dropdown is now
 * populated from the real Warehouse master (see api/warehouseApi.js). The
 * actual batch/serial rows and stats come from the real API (see
 * api/batchSerialApi.js) — no static row data lives here any more.
 */

export const BATCH_SERIAL_TYPE_OPTIONS = ['Batch', 'Serial'];

export const STATUS_OPTIONS = [
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];
