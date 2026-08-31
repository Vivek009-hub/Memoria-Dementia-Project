/**
 * caregiverDashboard.test.js — Integration & Unit Tests for Caregiver Dashboard (Phase F12 / B2)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../src/api/client.js';
import {
  listRelationships,
  createRelationship,
  updateRelationship,
  revokeRelationship,
  getPatientReminders,
  getPatientMemories,
  getPatientSafetyEvents,
  getPatientLocation,
} from '../src/api/caregiver.api.js';

describe('Caregiver Dashboard & Authorized Patient API Integration (Phase F12)', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new ApiClient({ baseUrl: 'http://test-server/api/v1' });
  });

  it('fetches linked patient relationships via GET /caregivers/relationships', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: {
        relationships: [
          {
            _id: 'rel_1',
            patientId: { _id: 'patient_100', name: 'Eleanor Vance', email: 'eleanor@memora.com' },
            relationshipType: 'PRIMARY_FAMILY',
          },
        ],
      },
    });

    const res = await listRelationships(mockClient);

    expect(mockGet).toHaveBeenCalledWith('/caregivers/relationships');
    expect(res.success).toBe(true);
    expect(res.data.relationships[0].patientId.name).toBe('Eleanor Vance');
  });

  it('creates a new caregiver-patient relationship via POST /caregivers/relationships', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { relationship: { _id: 'rel_2', relationshipType: 'CAREGIVER' } },
    });

    const payload = { patientEmail: 'patient2@memora.com', relationshipType: 'CAREGIVER' };
    const res = await createRelationship(payload, mockClient);

    expect(mockPost).toHaveBeenCalledWith('/caregivers/relationships', payload);
    expect(res.success).toBe(true);
  });

  it('fetches authorized patient reminders via GET /reminders?patientId=<id>', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: [{ _id: 'rem_1', title: 'Morning Medication', status: 'COMPLETED' }],
    });

    const res = await getPatientReminders('patient_100', mockClient);

    expect(mockGet).toHaveBeenCalledWith('/reminders?patientId=patient_100');
    expect(res.success).toBe(true);
    expect(res.data[0].status).toBe('COMPLETED');
  });

  it('fetches authorized patient safety events via GET /safety/events?patientId=<id>', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: [{ _id: 'safe_1', type: 'POSSIBLE_FALL', status: 'RESOLVED' }],
    });

    const res = await getPatientSafetyEvents('patient_100', mockClient);

    expect(mockGet).toHaveBeenCalledWith('/safety/events?patientId=patient_100');
    expect(res.success).toBe(true);
    expect(res.data[0].type).toBe('POSSIBLE_FALL');
  });

  it('fetches authorized patient current location via GET /safety/location/current?patientId=<id>', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: { latitude: 28.6139, longitude: 77.2090, accuracy: 5 },
    });

    const res = await getPatientLocation('patient_100', mockClient);

    expect(mockGet).toHaveBeenCalledWith('/safety/location/current?patientId=patient_100');
    expect(res.success).toBe(true);
    expect(res.data.accuracy).toBe(5);
  });
});
