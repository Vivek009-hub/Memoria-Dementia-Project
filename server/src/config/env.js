import 'dotenv/config';

const required = ['MONGO_URI', 'SESSION_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',

  // Authentication / session
  sessionSecret: process.env.SESSION_SECRET,
  // Session lifetime in milliseconds — default 7 days
  sessionTtlMs: parseInt(process.env.SESSION_TTL_MS || String(7 * 24 * 60 * 60 * 1000), 10),
  // HTTP-only cookie name
  cookieName: process.env.COOKIE_NAME || 'memora_session',
};
