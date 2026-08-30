/**
 * authApi.js — Authentication API endpoints (B2)
 */

import { request } from './client.js';

export async function login(email, password) {
  return await request('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function register(userData) {
  return await request('/auth/register', {
    method: 'POST',
    body: userData,
  });
}

export async function getCurrentUser() {
  return await request('/auth/me');
}

export async function logout() {
  return await request('/auth/logout', {
    method: 'POST',
  });
}
