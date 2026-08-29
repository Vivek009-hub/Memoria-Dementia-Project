import { describe, it, expect, vi, beforeAll } from 'vitest';
import request from 'supertest';

// Mock env config so the test doesn't require real environment variables
vi.mock('../src/config/env.js', () => ({
  env: {
    nodeEnv: 'test',
    port: 5000,
    mongoUri: 'mongodb://localhost:27017/memora-test',
    clientUrl: 'http://localhost:5173',
    logLevel: 'silent',
    sessionSecret: 'test-secret-for-health-test',
    sessionTtlMs: 604800000,
    cookieName: 'memora_session',
  },
}));

// Import app AFTER mocking env
let app;
beforeAll(async () => {
  const module = await import('../src/app.js');
  app = module.default;
});

describe('GET /api/v1/health', () => {
  it('returns HTTP 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
  });

  it('returns success: true', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.body.success).toBe(true);
  });

  it('returns service: "memora-api"', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.body.service).toBe('memora-api');
  });

  it('returns status: "healthy"', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.body.status).toBe('healthy');
  });
});

describe('Unknown routes', () => {
  it('returns 404 for unknown GET route', async () => {
    const res = await request(app).get('/api/v1/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('returns 404 for root path', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(404);
  });
});
