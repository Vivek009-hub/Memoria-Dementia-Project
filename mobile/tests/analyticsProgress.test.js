/**
 * analyticsProgress.test.js — Integration & Unit Tests for Analytics & Progress UI (Phase F14)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../src/api/client.js';
import {
  getMeOverview,
  getPatientOverview,
  getGameSummary,
  getReminderSummary,
  getAdminOverviewAnalytics,
} from '../src/api/analytics.api.js';

describe('Analytics & Progress API Integration (Phase F14)', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new ApiClient({ baseUrl: 'http://test-server/api/v1' });
  });

  it('fetches patient self progress overview via GET /analytics/me/overview', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: {
        gamesCompleted: 8,
        reminderAdherenceRate: 85,
        memoriesAdded: 4,
        communitySessionsAttended: 2,
      },
    });

    const res = await getMeOverview(mockClient);

    expect(mockGet).toHaveBeenCalledWith('/analytics/me/overview');
    expect(res.success).toBe(true);
    expect(res.data.reminderAdherenceRate).toBe(85);
  });

  it('fetches caregiver authorized patient overview via GET /analytics/patient/:id/overview', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: {
        patientId: 'patient_100',
        gamesCompleted: 12,
        reminderAdherenceRate: 90,
      },
    });

    const res = await getPatientOverview('patient_100', mockClient);

    expect(mockGet).toHaveBeenCalledWith('/analytics/patient/patient_100/overview');
    expect(res.success).toBe(true);
    expect(res.data.reminderAdherenceRate).toBe(90);
  });

  it('fetches cognitive game summary via GET /analytics/games/summary', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: { gamesPlayed: 10, totalScore: 840, accuracy: 84 },
    });

    const res = await getGameSummary(mockClient);

    expect(mockGet).toHaveBeenCalledWith('/analytics/games/summary');
    expect(res.success).toBe(true);
    expect(res.data.accuracy).toBe(84);
  });

  it('fetches reminder summary via GET /analytics/reminders/summary', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: { completed: 17, pending: 3, adherenceRate: 85 },
    });

    const res = await getReminderSummary(mockClient);

    expect(mockGet).toHaveBeenCalledWith('/analytics/reminders/summary');
    expect(res.success).toBe(true);
    expect(res.data.completed).toBe(17);
  });

  it('fetches admin platform overview analytics via GET /admin/analytics/overview', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: { totalPatients: 45, totalCaregivers: 30, activeSOS: 0 },
    });

    const res = await getAdminOverviewAnalytics(mockClient);

    expect(mockGet).toHaveBeenCalledWith('/admin/analytics/overview');
    expect(res.success).toBe(true);
    expect(res.data.totalPatients).toBe(45);
  });
});
