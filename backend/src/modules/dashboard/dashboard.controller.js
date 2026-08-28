import * as dashboardService from './dashboard.service.js';

export function getHomeSummaryHandler(req, res) {
  const { outletId } = req.query;
  res.json({ success: true, data: dashboardService.getHomeSummary(outletId) });
}

export function getManagementSummaryHandler(req, res) {
  res.json({ success: true, data: dashboardService.getManagementSummary() });
}
