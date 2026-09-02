/**
 * auth.api.js — Authentication API Integration
 */

import { defaultApiClient } from './client.js';

export async function login(email, password, client = defaultApiClient) {
  const response = await client.post('/auth/login', { email, password });
  if (response?.data?.token) {
    client.setAuthToken(response.data.token);
  }
  return response;
}

export async function logout(client = defaultApiClient) {
  try {
    await client.post('/auth/logout');
  } finally {
    client.setAuthToken(null);
  }
}

export async function getCurrentUser(client = defaultApiClient) {
  return await client.get('/users/me');
}

export async function updateUserProfile(data, client = defaultApiClient) {
  return await client.patch('/users/me', data);
}
