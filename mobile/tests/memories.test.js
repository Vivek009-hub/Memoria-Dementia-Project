/**
 * memories.test.js — Integration & Unit Tests for Memory Assistance (Phase F5 / B5)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../src/api/client.js';
import {
  listMemories,
  getMemory,
  createMemory,
  updateMemory,
  deleteMemory,
  listFamilyMembers,
  createFamilyMember,
} from '../src/api/memories.api.js';

describe('Memory Assistance API Integration (Phase F5)', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = new ApiClient({ baseUrl: 'http://test-server/api/v1' });
  });

  it('formats listMemories query parameters correctly including patientId, search, and type', async () => {
    const mockGet = vi.spyOn(mockClient, 'get').mockResolvedValue({
      success: true,
      data: [{ _id: 'mem_1', title: 'Summer Picnic', type: 'EVENT' }],
      pagination: { page: 1, limit: 10, total: 1, pages: 1 },
    });

    const res = await listMemories(
      { type: 'EVENT', search: 'picnic', page: 1, limit: 10, sort: '-createdAt', patientId: 'patient_99' },
      mockClient
    );

    expect(mockGet).toHaveBeenCalledWith(
      '/memories?type=EVENT&search=picnic&page=1&limit=10&sort=-createdAt&patientId=patient_99'
    );
    expect(res.success).toBe(true);
    expect(res.data.length).toBe(1);
    expect(res.data[0].title).toBe('Summer Picnic');
  });

  it('calls createMemory with authorized memory payload', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'mem_2', title: 'My Old House', type: 'PLACE' },
    });

    const memoryPayload = {
      title: 'My Old House',
      description: 'Living in Chicago',
      type: 'PLACE',
      relatedPlace: 'Chicago, IL',
      datePrecision: 'year',
    };

    const res = await createMemory(memoryPayload, mockClient);

    expect(mockPost).toHaveBeenCalledWith('/memories', memoryPayload);
    expect(res.success).toBe(true);
    expect(res.data._id).toBe('mem_2');
  });

  it('calls updateMemory with partial patch data', async () => {
    const mockPatch = vi.spyOn(mockClient, 'patch').mockResolvedValue({
      success: true,
      data: { _id: 'mem_1', title: 'Updated Title' },
    });

    const updates = { title: 'Updated Title' };
    const res = await updateMemory('mem_1', updates, mockClient);

    expect(mockPatch).toHaveBeenCalledWith('/memories/mem_1', updates);
    expect(res.success).toBe(true);
    expect(res.data.title).toBe('Updated Title');
  });

  it('calls deleteMemory with patientId query param when provided', async () => {
    const mockDelete = vi.spyOn(mockClient, 'delete').mockResolvedValue({
      success: true,
      message: 'Memory deactivated',
    });

    const res = await deleteMemory('mem_1', 'patient_99', mockClient);

    expect(mockDelete).toHaveBeenCalledWith('/memories/mem_1?patientId=patient_99');
    expect(res.success).toBe(true);
  });

  it('manages family member directory calls accurately', async () => {
    const mockPost = vi.spyOn(mockClient, 'post').mockResolvedValue({
      success: true,
      data: { _id: 'fam_1', name: 'Grandson John', relationship: 'Grandson' },
    });

    const familyPayload = { name: 'Grandson John', relationship: 'Grandson' };
    const res = await createFamilyMember(familyPayload, mockClient);

    expect(mockPost).toHaveBeenCalledWith('/memories/family-members', familyPayload);
    expect(res.success).toBe(true);
    expect(res.data.name).toBe('Grandson John');
  });
});
