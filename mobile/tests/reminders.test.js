/**
 * reminders.test.js — Integration & Unit Tests for Reminders & Daily Routine (Phase F6 / B6)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../src/api/client.js';
import {
  listReminders,
  getReminder,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  skipReminder,
  getReminderHistory,
} from '../src/api/reminders.api.js';

describe('Reminders & Daily Routine API Integration (Phase F6)', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new ApiClient({ baseUrl: 'http://test-server/api/v1' });
  });

  it('formats listReminders query parameters correctly including patientId and type', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: [{ _id: 'rem_1', title: 'Heart Medication', type: 'MEDICATION' }],
    });

    const res = await listReminders({ type: 'MEDICATION', patientId: 'patient_123' }, mockClient);

    expect(mockGet).toHaveBeenCalledWith('/reminders?type=MEDICATION&patientId=patient_123');
    expect(res.success).toBe(true);
    expect(res.data[0].title).toBe('Heart Medication');
  });

  it('calls createReminder with structured schedule and timezone payload', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'rem_2', title: 'Lunch Meal' },
    });

    const reminderPayload = {
      title: 'Lunch Meal',
      type: 'MEAL',
      timezone: 'Asia/Kolkata',
      schedule: { time: '13:00' },
      recurrence: { frequency: 'DAILY', interval: 1, weekdays: [] },
      voiceEnabled: true,
    };

    const res = await createReminder(reminderPayload, mockClient);

    expect(mockPost).toHaveBeenCalledWith('/reminders', reminderPayload);
    expect(res.success).toBe(true);
    expect(res.data._id).toBe('rem_2');
  });

  it('calls completeReminder endpoint for occurrence completion', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { status: 'COMPLETED', completedAt: new Date().toISOString() },
    });

    const res = await completeReminder('rem_1', { note: 'Taken with water' }, 'patient_123', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/reminders/rem_1/complete?patientId=patient_123', {
      note: 'Taken with water',
    });
    expect(res.success).toBe(true);
    expect(res.data.status).toBe('COMPLETED');
  });

  it('calls skipReminder endpoint for occurrence dismissal', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { status: 'CANCELLED' },
    });

    const res = await skipReminder('rem_1', { note: 'Skipped today' }, undefined, mockClient);

    expect(mockPost).toHaveBeenCalledWith('/reminders/rem_1/skip', { note: 'Skipped today' });
    expect(res.success).toBe(true);
  });

  it('fetches occurrence history logs with pagination', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: [{ _id: 'log_1', status: 'COMPLETED' }],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });

    const res = await getReminderHistory({ limit: 10, patientId: 'patient_123' }, mockClient);

    expect(mockGet).toHaveBeenCalledWith('/reminders/history?limit=10&patientId=patient_123');
    expect(res.success).toBe(true);
    expect(res.data.length).toBe(1);
  });
});
