import { Router } from 'express';
import rateLimit from 'express-rate-limit';

import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateRegister, validateLogin } from './auth.validation.js';
import * as authController from './auth.controller.js';
import { AppError } from '../../utils/AppError.js';
import { env } from '../../config/env.js';

const router = Router();

/**
 * Rate limiting for sensitive authentication endpoints.
 *
 * Configured conservatively for development.
 * In production, these values should be tightened and a shared store
 * (e.g. Redis) should be used if running multiple instances.
 *
 * Per CLAUDE.md §31: no Redis/distributed infra in B2.
 *
 * Rate limiting is disabled in the test environment to prevent the test
 * suite's repeated requests from the same IP from hitting the limit.
 */
const noopMiddleware = (_req, _res, next) => next();

const authRateLimit =
  env.nodeEnv === 'test'
    ? noopMiddleware
    : rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 20, // 20 attempts per window per IP
        standardHeaders: true,
        legacyHeaders: false,
        message: {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please try again later.',
          },
        },
      });

/**
 * Validation middleware factory.
 * Runs the given validator and throws a VALIDATION_ERROR if invalid.
 */
function validate(validatorFn) {
  return (req, _res, next) => {
    const { valid, errors } = validatorFn(req.body);
    if (!valid) {
      return next(new AppError(`Validation failed: ${errors.join(', ')}`, 422, 'VALIDATION_ERROR'));
    }
    next();
  };
}

// POST /api/v1/auth/register
router.post('/register', authRateLimit, validate(validateRegister), authController.register);

// POST /api/v1/auth/login
router.post('/login', authRateLimit, validate(validateLogin), authController.login);

// POST /api/v1/auth/logout  (requires authentication)
router.post('/logout', requireAuth, authController.logout);

// GET  /api/v1/auth/me  (requires authentication)
router.get('/me', requireAuth, authController.me);

export default router;
