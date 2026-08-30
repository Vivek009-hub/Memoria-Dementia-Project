import { Router } from 'express';
import authRouter from '../modules/auth/auth.routes.js';
import usersRouter from '../modules/users/users.routes.js';
import patientsRouter from '../modules/patients/patients.routes.js';
import caregiversRouter from '../modules/caregivers/caregivers.routes.js';
import gamesRouter from '../modules/games/game.routes.js';

const router = Router();

// GET /api/v1/health
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'memora-api',
    status: 'healthy',
  });
});

// B2 — Authentication
router.use('/auth', authRouter);

// B3 — Users / Patients / Caregivers
router.use('/users', usersRouter);
router.use('/patients', patientsRouter);
router.use('/caregivers', caregiversRouter);

// B4 — Cognitive Games
router.use('/games', gamesRouter);

export default router;

