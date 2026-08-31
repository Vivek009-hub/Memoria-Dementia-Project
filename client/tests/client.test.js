import { describe, it, expect, vi, beforeEach } from 'vitest';
import { request } from '../src/api/client.js';
import { getFriendlyErrorMessage } from '../src/utils/errorUtils.js';

describe('Central API Client (F0 Foundation)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('translates backend error codes into user-friendly messages', () => {
    expect(getFriendlyErrorMessage({ code: 'UNAUTHORIZED' })).toBe('Your session has expired. Please sign in again.');
    expect(getFriendlyErrorMessage({ code: 'FORBIDDEN' })).toBe('You do not have permission to access this resource.');
    expect(getFriendlyErrorMessage({ code: 'RESOURCE_NOT_FOUND' })).toBe("We couldn't find the requested information.");
    expect(getFriendlyErrorMessage({ code: 'RATE_LIMIT_EXCEEDED' })).toBe('Too many requests. Please wait a moment and try again.');
  });

  it('parses JSON responses and passes session credentials', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: { user: { id: '123', email: 'test@memora.com' } } }),
    });

    const res = await request('/auth/me');
    expect(res.success).toBe(true);
    expect(res.data.user.email).toBe('test@memora.com');
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/auth/me', expect.objectContaining({
      credentials: 'include',
    }));
  });

  it('normalizes HTTP errors into standardized error instances', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission' },
      }),
    });

    await expect(request('/admin/analytics')).rejects.toThrow('You do not have permission to access this resource.');
  });
});
