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

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers — allow cross-origin resource access for uploaded images
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS — origin controlled by CLIENT_URL env variable
// credentials:true is required for cross-origin cookie support
app.use(cors(buildCorsOptions(env.clientUrl)));

// Request logging — must come before routes
app.use(requestLogger);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parsing — required for session cookie authentication
app.use(cookieParser());

// Static file serving for user uploads (memories, images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API routes
app.use('/api/v1', v1Router);

// 404 handler — must come after routes
app.use(notFound);

// Central error handler — must be last middleware (4 args)
app.use(errorHandler);

export default app;
