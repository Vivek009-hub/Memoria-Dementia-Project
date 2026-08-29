import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  logger.error({ err, statusCode, code }, 'Request error');

  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };

  // Never expose stack traces or internal details in production
  if (env.nodeEnv === 'development') {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
