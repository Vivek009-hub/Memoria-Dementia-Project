/**
 * aiAssistantFull.test.js — Integration & Unit Tests for B11 AI Companion (Phase F10)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../src/api/client.js';
import {
  askMemoryAssistant,
  searchMemoriesNL,
  sendChatMessage,
  getRecommendations,
  getAIUsage,
} from '../src/api/ai.api.js';

describe('AI Cognitive & Memory Companion API Integration (Phase F10)', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new ApiClient({ baseUrl: 'http://test-server/api/v1' });
  });

  it('queries grounded memory assistant via POST /ai/memory-assistant', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { answer: 'Your daughter Sarah visited on Sunday.', sources: ['mem_1'] },
    });

    const res = await askMemoryAssistant('Who visited me on Sunday?', 'en', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/ai/memory-assistant', {
      message: 'Who visited me on Sunday?',
      language: 'en',
    });
    expect(res.success).toBe(true);
    expect(res.data.answer).toContain('Sarah');
  });

  it('searches memories using natural language via POST /ai/memory-search', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: [{ _id: 'mem_1', title: 'Grandson Birthday Party' }],
    });

    const res = await searchMemoriesNL('birthday celebrations', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/ai/memory-search', { query: 'birthday celebrations' });
    expect(res.success).toBe(true);
    expect(res.data[0].title).toBe('Grandson Birthday Party');
  });

  it('sends conversational chat message via POST /ai/chat', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { response: 'Good morning! How are you feeling today?' },
    });

    const res = await sendChatMessage('Good morning', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/ai/chat', { message: 'Good morning' });
    expect(res.success).toBe(true);
    expect(res.data.response).toContain('feeling');
  });

  it('fetches personalized cognitive recommendations via GET /ai/recommendations', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: {
        games: [{ id: 'memory_match', title: 'Memory Match', category: 'Cognitive' }],
        routine: 'Morning music therapy',
      },
    });

    const res = await getRecommendations(mockClient);

    expect(mockGet).toHaveBeenCalledWith('/ai/recommendations');
    expect(res.success).toBe(true);
    expect(res.data.games[0].title).toBe('Memory Match');
  });

  it('fetches AI usage statistics via GET /ai/usage', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: { totalQueries: 14, remainingQuota: 86 },
    });

    const res = await getAIUsage(mockClient);

    expect(mockGet).toHaveBeenCalledWith('/ai/usage');
    expect(res.success).toBe(true);
    expect(res.data.totalQueries).toBe(14);
  });
});
