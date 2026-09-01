import { describe, it, expect } from 'vitest';
import { parseNaturalTime } from './timeParser.js';

describe('timeParser — Natural Relative Time Parser', () => {
  const mockNow = new Date('2026-09-01T10:00:00.000Z');

  it('parses relative minutes ("in 15 minutes")', () => {
    const result = parseNaturalTime({ timeExpression: 'in 15 minutes', now: mockNow });
    expect(result.scheduledAt.getTime()).toBe(mockNow.getTime() + 15 * 60 * 1000);
  });

  it('parses relative hours ("in 2 hours")', () => {
    const result = parseNaturalTime({ timeExpression: 'in 2 hours', now: mockNow });
    expect(result.scheduledAt.getTime()).toBe(mockNow.getTime() + 2 * 60 * 60 * 1000);
  });

  it('parses "in half an hour"', () => {
    const result = parseNaturalTime({ timeExpression: 'in half an hour', now: mockNow });
    expect(result.scheduledAt.getTime()).toBe(mockNow.getTime() + 30 * 60 * 1000);
  });

  it('parses explicit delayMinutes (delayMinutes = 45)', () => {
    const result = parseNaturalTime({ delayMinutes: 45, now: mockNow });
    expect(result.scheduledAt.getTime()).toBe(mockNow.getTime() + 45 * 60 * 1000);
  });

  it('parses "tomorrow morning"', () => {
    const result = parseNaturalTime({ timeExpression: 'tomorrow morning', now: mockNow });
    expect(result.scheduledAt.getHours()).toBe(9);
  });

  it('rejects invalid/past time expressions', () => {
    expect(() =>
      parseNaturalTime({ delayMinutes: -10, now: mockNow })
    ).toThrow();
  });

  it('rejects unparseable time expression strings', () => {
    expect(() =>
      parseNaturalTime({ timeExpression: 'someday far away', now: mockNow })
    ).toThrow();
  });
});
