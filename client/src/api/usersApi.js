/**
 * usersApi.js — User Profile API endpoints (B3)
 */

import { request } from './client.js';

export async function getUserProfile() {
  return await request('/users/me');
}

export async function updateUserProfile(updateData) {
  return await request('/users/me', {
    method: 'PATCH',
    body: updateData,
  });
}
