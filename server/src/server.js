import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import app from './app.js';

import {
  startProactiveScheduler,
  stopProactiveScheduler,
} from './modules/ai/proactive/proactiveScheduler.service.js';

async function start() {
  try {
    await connectDatabase(env.mongoUri);

    startProactiveScheduler();

    const server = app.listen(env.port, () => {
      logger.info({ port: env.port, env: env.nodeEnv }, `Memora API server started`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info({ signal }, 'Shutdown signal received');
      stopProactiveScheduler();
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
}

start();
