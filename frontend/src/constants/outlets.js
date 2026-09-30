/**
 * DEPRECATED — no longer used.
 * -------------------------------------------------------------------------
 * The login screen's "Select Outlet" dropdown now reads from the real
 * Outlet API (see api/outletApi.js's useGetPublicOutletsQuery, wired in
 * LoginPage.jsx). This file is kept only so the diff is easy to review; it
 * is safe to delete this file.
 */
export const MOCK_OUTLETS = [
  { value: 'main-outlet', label: 'Kayal Agro Foods - Main Outlet' },
  { value: 'head-office', label: 'Kayal Agro Foods - Head Office' },
  { value: 'saravanampatti', label: 'Kayal Agro Foods - Saravanampatti' },
  { value: 'peelamedu', label: 'Kayal Agro Foods - Peelamedu' },
  { value: 'singanallur', label: 'Kayal Agro Foods - Singanallur' },
];
