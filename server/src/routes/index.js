import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes.js';

const router = Router();

// GET /api/v1/health
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'memora-api',
    status: 'healthy',
  });
});

// Authentication — /api/v1/auth/*
router.use('/auth', authRouter);

export default router;
