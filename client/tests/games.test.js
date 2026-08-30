import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchGames,
  fetchGameById,
  startGameSession,
  submitGameSession,
  fetchGameHistory,
} from '../src/api/gamesApi.js';

describe('Cognitive Games API Integration (F4)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetchGames calls GET /api/v1/games with optional filters', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ _id: 'game1', title: 'Memory Match', category: 'MEMORY_MATCHING' }],
      }),
    });

    const res = await fetchGames({ category: 'MEMORY_MATCHING' });
    expect(res.success).toBe(true);
    expect(res.data[0].title).toBe('Memory Match');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/games?category=MEMORY_MATCHING',
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('fetchGameById calls GET /api/v1/games/:gameId', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { _id: 'game123', title: 'Sequence Recall' },
      }),
    });

    const res = await fetchGameById('game123');
    expect(res.data.title).toBe('Sequence Recall');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/games/game123',
      expect.objectContaining({ credentials: 'include' })
    );
  });

  it('startGameSession calls POST /api/v1/games/:gameId/sessions with difficulty', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { _id: 'session_123', gameId: 'game1', difficulty: 'EASY', status: 'STARTED' },
      }),
    });

    const res = await startGameSession('game1', 'EASY');
    expect(res.data._id).toBe('session_123');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/games/game1/sessions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ difficulty: 'EASY', metadata: {} }),
      })
    );
  });

  it('submitGameSession calls POST /api/v1/games/sessions/:sessionId/complete', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: { _id: 'session_123', status: 'COMPLETED', score: 90, accuracy: 100 },
      }),
    });

    const resultData = { score: 90, accuracy: 100, responseTimeMs: 15000, mistakes: 0 };
    const res = await submitGameSession('session_123', resultData);
    expect(res.data.status).toBe('COMPLETED');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/games/sessions/session_123/complete',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(resultData),
      })
    );
  });

  it('fetchGameHistory calls GET /api/v1/games/history', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: [{ _id: 'session_1', score: 80, completedAt: '2026-08-31T00:00:00Z' }],
      }),
    });

    const res = await fetchGameHistory();
    expect(res.data.length).toBe(1);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/games/history',
      expect.objectContaining({ credentials: 'include' })
    );
  });
});
