/**
 * community.test.js — Integration & Unit Tests for Community Sessions & Meeting Circle (Phase F7 / B7 / B8)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../src/api/client.js';
import {
  getVotingProposals,
  voteForProposal,
  removeVote,
  getSchedule,
  registerForSession,
  cancelRegistration,
} from '../src/api/community.api.js';
import { joinMeeting, getMeeting, leaveMeeting } from '../src/api/meetings.api.js';

describe('Community Sessions & Meeting Circle API Integration (Phase F7)', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new ApiClient({ baseUrl: 'http://test-server/api/v1' });
  });

  it('fetches voting proposals from /community/sessions/voting', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: [{ _id: 'idea_1', title: 'Music & Memory', voteCount: 42 }],
    });

    const res = await getVotingProposals({}, mockClient);

    expect(mockGet).toHaveBeenCalledWith('/community/sessions/voting');
    expect(res.success).toBe(true);
    expect(res.data[0].title).toBe('Music & Memory');
  });

  it('submits a vote for a session idea via POST /community/sessions/ideas/:ideaId/vote', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      hasVoted: true,
    });

    const res = await voteForProposal('idea_1', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/community/sessions/ideas/idea_1/vote');
    expect(res.success).toBe(true);
    expect(res.hasVoted).toBe(true);
  });

  it('removes a vote via DELETE /community/sessions/ideas/:ideaId/vote', async () => {
    const mockDelete = vi.spyOn(mockClient, 'delete').mockResolvedValue({
      success: true,
      hasVoted: false,
    });

    const res = await removeVote('idea_1', mockClient);

    expect(mockDelete).toHaveBeenCalledWith('/community/sessions/ideas/idea_1/vote');
    expect(res.success).toBe(true);
  });

  it('fetches scheduled community sessions from /community/sessions/schedule', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: [{ _id: 'sess_1', title: 'Therapeutic Choir', capacity: 20, registeredCount: 12 }],
    });

    const res = await getSchedule({}, mockClient);

    expect(mockGet).toHaveBeenCalledWith('/community/sessions/schedule');
    expect(res.success).toBe(true);
    expect(res.data[0].capacity).toBe(20);
  });

  it('pre-registers for a session via POST /community/sessions/:sessionId/register', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      userRegistration: { status: 'REGISTERED' },
    });

    const res = await registerForSession('sess_1', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/community/sessions/sess_1/register');
    expect(res.success).toBe(true);
    expect(res.userRegistration.status).toBe('REGISTERED');
  });

  it('joins a Meeting Circle room via POST /meetings/sessions/:sessionId/meeting/join', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { roomName: 'room_sess_1', participantCount: 5 },
    });

    const res = await joinMeeting('sess_1', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/meetings/sessions/sess_1/meeting/join');
    expect(res.success).toBe(true);
    expect(res.data.participantCount).toBe(5);
  });
});
