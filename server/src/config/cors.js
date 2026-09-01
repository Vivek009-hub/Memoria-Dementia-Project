export function buildCorsOptions(clientUrl) {
  const configuredOrigins = (clientUrl || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean);

  const defaultDevOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
  ];

  const allowedOrigins = Array.from(new Set([...configuredOrigins, ...defaultDevOrigins]));

  return {
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. native mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}
