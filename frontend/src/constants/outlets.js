/**
 * TEMPORARY mock outlet list.
 * -------------------------------------------------------------------------
 * The Outlet master module (backed by Prisma + PostgreSQL) hasn't been
 * built yet, so the login screen's "Select Outlet" dropdown reads from this
 * static list rather than an API. Replace this with an RTK Query
 * `useGetOutletsQuery()` call once the Outlet module exists — do not add
 * more mock data here in the meantime.
 */
export const MOCK_OUTLETS = [
  { value: 'main-outlet', label: 'Kayal Agro Foods - Main Outlet' },
  { value: 'head-office', label: 'Kayal Agro Foods - Head Office' },
  { value: 'saravanampatti', label: 'Kayal Agro Foods - Saravanampatti' },
  { value: 'peelamedu', label: 'Kayal Agro Foods - Peelamedu' },
  { value: 'singanallur', label: 'Kayal Agro Foods - Singanallur' },
];
