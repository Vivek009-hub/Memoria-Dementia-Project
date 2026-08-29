import { Router } from 'express';

const router = Router();

// GET /api/v1/health
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'memora-api',
    status: 'healthy',
  });
});

export default router;
