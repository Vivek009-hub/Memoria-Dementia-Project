/**
 * SOSScreen.jsx — Single-Step SOS Emergency Activation & Confirmation
 */

import React, { useState } from 'react';
import { colors } from '../theme/colors.js';
import { ElderButton } from '../components/ElderButton.jsx';
import { useSafety } from '../context/SafetyContext.jsx';
import { t } from '../i18n/i18n.js';

export function SOSScreen({ onNavigate }) {
  const { triggerSOS } = useSafety();
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmSOS = async () => {
    setIsSubmitting(true);
    try {
      const res = await triggerSOS();
      if (res.status === 'SENT') {
        setFeedback({
          type: 'success',
          text: t('sos.sentSuccess', 'SOS sent. Your emergency contacts have been notified.'),
        });
      } else {
        setFeedback({
          type: 'warning',
          text: t('sos.waitingToSend', 'SOS waiting to send (offline).'),
        });
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        text: t('sos.sentFailed', 'We could not send the SOS. Please try again.'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        padding: '28px',
        backgroundColor: colors.background,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '480px',
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      <div style={{ fontSize: '64px', marginBottom: '16px' }}>🚨</div>

      <h1 style={{ fontSize: '32px', color: colors.danger, marginBottom: '24px' }}>
        {t('sos.title', 'Do you need help?')}
      </h1>

      {feedback ? (
        <div style={{ width: '100%', marginBottom: '24px' }}>
          <div
            style={{
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: feedback.type === 'success' ? '#DCFCE7' : '#FEF3C7',
              color: feedback.type === 'success' ? colors.success : colors.warning,
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '20px',
              border: `2px solid ${feedback.type === 'success' ? colors.success : colors.warning}`,
            }}
          >
            {feedback.text}
          </div>
          <ElderButton
            title="Back to Home"
            onClick={() => onNavigate('Home')}
            variant="primary"
          />
        </div>
      ) : (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <ElderButton
            title={t('sos.yesSend', 'YES, SEND SOS')}
            onClick={handleConfirmSOS}
            variant="danger"
            disabled={isSubmitting}
            icon="🚨"
          />

          <ElderButton
            title={t('sos.cancel', 'CANCEL')}
            onClick={() => onNavigate('Home')}
            variant="secondary"
          />
        </div>
      )}
    </div>
  );
}
