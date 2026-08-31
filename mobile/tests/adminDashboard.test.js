/**
 * adminDashboard.test.js — Integration & Unit Tests for Admin Dashboard (Phase F13)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../src/api/client.js';
import {
  createProposal,
  getVotingResults,
  approveProposal,
  scheduleSession,
  cancelSession,
  createGame,
} from '../src/api/admin.api.js';

describe('Admin Dashboard & Platform Management API Integration (Phase F13)', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new ApiClient({ baseUrl: 'http://test-server/api/v1' });
  });

  it('posts new community proposal via POST /admin/community/sessions/ideas', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'idea_100', title: 'Art & Reminiscence Therapy', category: 'ART' },
    });

    const payload = { title: 'Art & Reminiscence Therapy', description: 'Painting memories', category: 'ART' };
    const res = await createProposal(payload, mockClient);

    expect(mockPost).toHaveBeenCalledWith('/admin/community/sessions/ideas', payload);
    expect(res.success).toBe(true);
    expect(res.data.title).toBe('Art & Reminiscence Therapy');
  });

  it('fetches proposal voting tally results via GET /admin/community/sessions/voting/results', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: [{ _id: 'idea_100', title: 'Art & Reminiscence Therapy', voteCount: 14 }],
    });

    const res = await getVotingResults(mockClient);

    expect(mockGet).toHaveBeenCalledWith('/admin/community/sessions/voting/results');
    expect(res.success).toBe(true);
    expect(res.data[0].voteCount).toBe(14);
  });

  it('approves proposal via POST /admin/community/sessions/ideas/:id/approve', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'idea_100', status: 'APPROVED' },
    });

    const res = await approveProposal('idea_100', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/admin/community/sessions/ideas/idea_100/approve');
    expect(res.success).toBe(true);
    expect(res.data.status).toBe('APPROVED');
  });

  it('schedules approved community session via POST /admin/community/sessions/schedule', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'sess_500', title: 'Art & Reminiscence Therapy', maxCapacity: 25 },
    });

    const payload = {
      ideaId: 'idea_100',
      title: 'Art & Reminiscence Therapy',
      scheduledAt: '2026-09-05 10:00 AM',
      hostName: 'Dr. Sarah',
      maxCapacity: 25,
    };
    const res = await scheduleSession(payload, mockClient);

    expect(mockPost).toHaveBeenCalledWith('/admin/community/sessions/schedule', payload);
    expect(res.success).toBe(true);
    expect(res.data.maxCapacity).toBe(25);
  });

  it('cancels scheduled session via POST /admin/community/sessions/:id/cancel', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'sess_500', status: 'CANCELLED' },
    });

    const res = await cancelSession('sess_500', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/admin/community/sessions/sess_500/cancel');
    expect(res.success).toBe(true);
    expect(res.data.status).toBe('CANCELLED');
  });

  it('creates cognitive game definition via POST /games', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'game_99', title: 'Pattern Sequence' },
    });

    const payload = { title: 'Pattern Sequence', category: 'MEMORY', difficulty: 'EASY' };
    const res = await createGame(payload, mockClient);

    expect(mockPost).toHaveBeenCalledWith('/games', payload);
    expect(res.success).toBe(true);
    expect(res.data.title).toBe('Pattern Sequence');
  });
});
