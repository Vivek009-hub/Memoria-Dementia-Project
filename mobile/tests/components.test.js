/**
 * components.test.js — Localization, Voice & Theme Component Tests
 */

import { describe, it, expect } from 'vitest';
import { t, setLocale, getLocale } from '../src/i18n/i18n.js';
import { voiceService } from '../src/services/voice.service.js';
import { colors } from '../src/theme/colors.js';

describe('Localization, Voice & Theme (B13)', () => {
  it('switches locales between English and Hindi correctly', () => {
    setLocale('en');
    expect(getLocale()).toBe('en');
    expect(t('app.name')).toBe('Memora');
    expect(t('home.sos')).toBe('SOS Emergency');

    setLocale('hi');
    expect(getLocale()).toBe('hi');
    expect(t('app.name')).toBe('मेमोरा');
    expect(t('home.sos')).toBe('आपतकालीन SOS');

    // Reset to en
    setLocale('en');
  });

  it('requires explicit confirmation for voice SOS trigger', () => {
    const res = voiceService.processVoiceCommand('Please send SOS help');
    expect(res.action).toBe('CONFIRM_SOS');
    expect(res.requiresConfirmation).toBe(true);
    expect(res.prompt).toBe('Do you want to send an emergency SOS?');
  });

  it('provides high contrast theme colors for accessibility', () => {
    expect(colors.primary).toBe('#D8B24C');
    expect(colors.danger).toBe('#D95C5C');
    expect(colors.textPrimary).toBe('#F5F5F0');
  });
});
