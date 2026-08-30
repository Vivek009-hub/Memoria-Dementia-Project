/**
 * gamesApi.js — Cognitive Games API integration for B4 backend endpoints
 */

import { request } from './client.js';

export async function fetchGames(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.difficulty) params.append('difficulty', filters.difficulty);
  const query = params.toString() ? `?${params.toString()}` : '';
  return await request(`/games${query}`);
}

export async function fetchGameById(gameId) {
  return await request(`/games/${gameId}`);
}

export async function startGameSession(gameId, difficulty = 'MEDIUM', metadata = {}) {
  return await request(`/games/${gameId}/sessions`, {
    method: 'POST',
    body: { difficulty, metadata },
  });
}

export async function fetchGameSession(sessionId) {
  return await request(`/games/sessions/${sessionId}`);
}

export async function submitGameSession(sessionId, resultData) {
  return await request(`/games/sessions/${sessionId}/complete`, {
    method: 'POST',
    body: resultData,
  });
}

export async function fetchGameHistory(gameId = null) {
  const query = gameId ? `?gameId=${gameId}` : '';
  return await request(`/games/history${query}`);
}

export async function fetchCaregiverPatientHistory(patientId, gameId = null) {
  const query = gameId ? `?gameId=${gameId}` : '';
  return await request(`/games/patients/${patientId}/history${query}`);
}
