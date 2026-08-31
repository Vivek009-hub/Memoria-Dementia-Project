/**
 * trafficLogger.middleware.js — Express Middleware to Log Operational API Traffic Metrics
 *
 * Excludes sensitive credentials, bodies, or tokens.
 */

import TrafficLog from '../modules/analytics/trafficLog.model.js';

export function trafficLogger(req, res, next) {
  // Skip non-API static asset requests
  if (!req.originalUrl.startsWith('/api')) {
    return next();
  }

  const startTime = Date.now();

  res.on('finish', async () => {
    try {
      const responseTimeMs = Date.now() - startTime;
      const cleanEndpoint = req.originalUrl.split('?')[0];

      await TrafficLog.create({
        endpoint: cleanEndpoint,
        method: req.method,
        statusCode: res.statusCode,
        responseTimeMs,
        userId: req.user?.id || req.user?._id || null,
        timestamp: new Date(),
      });
    } catch {
      // Non-blocking log failure
    }
  });

  next();
}
