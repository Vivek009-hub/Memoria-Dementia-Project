/**
 * OfflineBanner.jsx — Non-Intrusive Offline Status Indicator
 */

import React from 'react';
import { colors } from '../theme/colors.js';
import { t } from '../i18n/i18n.js';

export function OfflineBanner({ isOnline = true }) {
  if (isOnline) return null;

  return (
    <div
      style={{
        backgroundColor: colors.warning,
        color: colors.white,
        padding: '10px 16px',
        textAlign: 'center',
        fontSize: '16px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      <span>⚠️</span>
      <span>{t('status.offline', 'No internet connection')}</span>
    </div>
  );
}
