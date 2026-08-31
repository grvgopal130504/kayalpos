import * as healthService from './health.service.js';

/**
 * Never throws: getHealthStatus() already swallows its own DB-check errors,
 * and the try/catch here is a second guard so a bug in that logic still
 * can't surface as a 500 — this endpoint must always answer 200 or 503 with
 * a well-formed body, since uptime monitors and the frontend's polling tag
 * both depend on it.
 */
export async function getHealthHandler(req, res) {
  try {
    const result = await healthService.getHealthStatus();
    res.status(result.status === 'healthy' ? 200 : 503).json(result);
  } catch {
    res.status(503).json({
      status: 'unhealthy',
      services: { backend: true, database: false },
      timestamp: new Date().toISOString(),
    });
  }
}
