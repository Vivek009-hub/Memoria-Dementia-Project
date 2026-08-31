/**
 * aiAssistant.test.js — Tests for B11 AI Assistance & Memory QA Integration (Phase F5)
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

describe('B11 AI Cognitive & Memory Assistance API Integration', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new ApiClient({ baseUrl: 'http://test-server/api/v1' });
  });

  it('sends question to B11 memory assistant endpoint with language parameter', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: {
        answer: 'You visited Yellowstone National Park with your family in July 2025.',
        memoriesUsed: ['mem_1'],
        grounded: true,
      },
    });

    const res = await askMemoryAssistant('Where did I go on vacation?', 'en', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/ai/memory-assistant', {
      message: 'Where did I go on vacation?',
      language: 'en',
    });
    expect(res.success).toBe(true);
    expect(res.data.grounded).toBe(true);
    expect(res.data.answer).toContain('Yellowstone');
  });

  it('sends natural language search query to /ai/memory-search', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: {
        results: [{ _id: 'mem_1', title: 'Yellowstone Trip' }],
      },
    });

    const res = await searchMemoriesNL('Find photos from my summer trip', mockClient);

    expect(mockPost).toHaveBeenCalledWith('/ai/memory-search', {
      query: 'Find photos from my summer trip',
    });
    expect(res.success).toBe(true);
    expect(res.data.results.length).toBe(1);
  });

  it('fetches personalized activity recommendations from /ai/recommendations', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: {
        recommendedGames: ['MEMORY_MATCHING'],
        reasoning: 'Cognitive engagement booster',
      },
    });

    const res = await getRecommendations(mockClient);

    expect(mockGet).toHaveBeenCalledWith('/ai/recommendations');
    expect(res.success).toBe(true);
    expect(res.data.recommendedGames).toContain('MEMORY_MATCHING');
  });
});
