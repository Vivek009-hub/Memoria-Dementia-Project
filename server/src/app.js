import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import { env } from './config/env.js';
import { buildCorsOptions } from './config/cors.js';
import { requestLogger } from './middleware/requestLogger.middleware.js';
import { notFound } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import v1Router from './routes/index.js';

const app = express();

// Security headers
app.use(helmet());

// CORS — origin controlled by CLIENT_URL env variable
// credentials:true is required for cross-origin cookie support
app.use(cors(buildCorsOptions(env.clientUrl)));

// Request logging — must come before routes
app.use(requestLogger);

// Body parsing
app.use(express.json());

// Cookie parsing — required for session cookie authentication
app.use(cookieParser());

// API routes
app.use('/api/v1', v1Router);

// 404 handler — must come after routes
app.use(notFound);

// Central error handler — must be last middleware (4 args)
app.use(errorHandler);

export default app;
