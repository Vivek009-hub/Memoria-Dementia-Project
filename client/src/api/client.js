/**
 * client.js — Canonical API Client for Memora Web Frontend
 */

import { getFriendlyErrorMessage } from '../utils/errorUtils.js';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include', // Includes session cookie memora_session
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(getFriendlyErrorMessage(data.error || { message: `HTTP ${response.status}` }));
      error.status = response.status;
      error.code = data.error?.code || 'API_ERROR';
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (!err.status) {
      err.isNetworkError = true;
      err.message = getFriendlyErrorMessage(err);
    }
    throw err;
  }
}
