/**
 * FallAlertModal.jsx — Interactive Fall Confirmation Overlay
 */

import React, { useEffect, useState } from 'react';
import { colors } from '../theme/colors.js';
import { ElderButton } from './ElderButton.jsx';
import { t } from '../i18n/i18n.js';

export function FallAlertModal({ isVisible, onImOkay, onNeedHelp, countdownSeconds = 30 }) {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(countdownSeconds);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onNeedHelp) onNeedHelp({ timedOut: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, countdownSeconds, onNeedHelp]);

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: '16px',
          padding: '28px',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          border: `4px solid ${colors.danger}`,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🚨</div>
        <h2 style={{ fontSize: '26px', color: colors.danger, margin: '0 0 8px 0' }}>
          {t('fall.title', 'Are you okay?')}
        </h2>
        <p style={{ fontSize: '20px', color: colors.textPrimary, marginBottom: '16px' }}>
          {t('fall.detected', 'Fall may have occurred')}
        </p>

        <div
          style={{
            fontSize: '36px',
            fontWeight: 'bold',
            color: colors.danger,
            marginBottom: '24px',
            padding: '12px',
            backgroundColor: '#FEE2E2',
            borderRadius: '12px',
          }}
        >
          {timeLeft}s
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ElderButton
            title={t('fall.imOkay', "YES, I'M OKAY")}
            onClick={onImOkay}
            variant="success"
            icon="✅"
          />
          <ElderButton
            title={t('fall.needHelp', 'I NEED HELP')}
            onClick={() => onNeedHelp({ timedOut: false })}
            variant="danger"
            icon="🚨"
          />
        </div>
      </div>
    </div>
  );
}
