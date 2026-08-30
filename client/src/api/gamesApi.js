/**
 * gamesApi.js — Cognitive Games API endpoints (B4)
 */

import { request } from './client.js';

export async function fetchGames(category) {
  const query = category ? `?category=${category}` : '';
  return await request(`/games${query}`);
}

export async function fetchGameById(gameId) {
  return await request(`/games/${gameId}`);
}

export async function startGameSession(gameId, difficulty = 'MEDIUM') {
  return await request('/games/sessions/start', {
    method: 'POST',
    body: { gameId, difficulty },
  });
}

export async function submitGameSession(sessionId, sessionData) {
  return await request(`/games/sessions/${sessionId}/submit`, {
    method: 'POST',
    body: sessionData,
  });
}
