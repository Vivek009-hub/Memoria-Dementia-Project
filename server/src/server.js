import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { logger } from './utils/logger.js';
import app from './app.js';
import { getProvider, isGeminiConfigured } from './modules/ai/providers/index.js';

import {
  startProactiveScheduler,
  stopProactiveScheduler,
} from './modules/ai/proactive/proactiveScheduler.service.js';

async function start() {
  try {
    await connectDatabase(env.mongoUri);

    // AI Provider initialization check
    const activeProvider = getProvider();
    if (isGeminiConfigured()) {
      logger.info({ provider: activeProvider.name, model: activeProvider.model }, 'Gemini AI Agent Engine initialized & ready');
    } else {
      logger.warn('Gemini AI is not configured. Set GEMINI_API_KEY in the server environment (running in Development Mock Mode).');
    }

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
