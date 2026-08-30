/**
 * contacts.api.js — B3 Emergency Contacts API Integration
 */

import { defaultApiClient } from './client.js';

export async function getEmergencyContacts(client = defaultApiClient) {
  return await client.get('/patients/me/emergency-contacts');
}
