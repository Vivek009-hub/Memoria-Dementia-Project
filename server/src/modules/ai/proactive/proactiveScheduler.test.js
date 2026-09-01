import { describe, it, expect } from 'vitest';
import { isQuietHours, isCooldownActive } from './proactiveScheduler.service.js';

describe('proactiveScheduler — Quiet Hours & Cooldown Logic', () => {
  it('correctly detects quiet hours spanning midnight (22:00 to 07:00)', () => {
    const quietHours = { enabled: true, start: '22:00', end: '07:00' };

    // 23:30 is in quiet hours
    const night = new Date('2026-09-01T23:30:00');
    expect(isQuietHours(quietHours, night)).toBe(true);

    // 03:15 is in quiet hours
    const earlyMorning = new Date('2026-09-01T03:15:00');
    expect(isQuietHours(quietHours, earlyMorning)).toBe(true);

    // 14:00 is NOT in quiet hours
    const afternoon = new Date('2026-09-01T14:00:00');
    expect(isQuietHours(quietHours, afternoon)).toBe(false);
  });

  it('returns false when quiet hours are disabled', () => {
    const quietHours = { enabled: false, start: '22:00', end: '07:00' };
    const night = new Date('2026-09-01T23:30:00');
    expect(isQuietHours(quietHours, night)).toBe(false);
  });

  it('correctly calculates interaction frequency cooldowns', () => {
    const now = new Date('2026-09-01T12:00:00.000Z');
    const twentyMinsAgo = new Date(now.getTime() - 20 * 60 * 1000);
    const threeHoursAgo = new Date(now.getTime() - 180 * 60 * 1000);

    // HIGH frequency (30m cooldown): 20 mins ago is active cooldown
    expect(isCooldownActive(twentyMinsAgo, 'HIGH', now)).toBe(true);

    // HIGH frequency: 3 hours ago is NOT active cooldown
    expect(isCooldownActive(threeHoursAgo, 'HIGH', now)).toBe(false);

    // LOW frequency (240m = 4h cooldown): 3 hours ago IS active cooldown
    expect(isCooldownActive(threeHoursAgo, 'LOW', now)).toBe(true);
  });
});
