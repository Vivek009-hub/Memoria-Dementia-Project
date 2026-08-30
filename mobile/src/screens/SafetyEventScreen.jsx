/**
 * SafetyEventScreen.jsx — Active Safety Alert Details Screen
 */

import React from 'react';
import { colors } from '../theme/colors.js';
import { ElderButton } from '../components/ElderButton.jsx';
import { useSafety } from '../context/SafetyContext.jsx';

export function SafetyEventScreen({ onNavigate, eventId }) {
  const { activeSafetyEvent } = useSafety();

  const event = activeSafetyEvent || {
    id: eventId || 'evt_current',
    type: 'SOS',
    status: 'ACKNOWLEDGED',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    locationAvailable: true,
  };

  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: colors.background,
        minHeight: '100vh',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontSize: '28px', color: colors.danger, textAlign: 'center', marginBottom: '24px' }}>
        🚨 Safety Event
      </h1>

      <div
        style={{
          backgroundColor: colors.cardBg,
          padding: '20px',
          borderRadius: '16px',
          border: `2px solid ${colors.border}`,
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <div>
          <span style={{ fontSize: '16px', color: colors.textSecondary }}>Type:</span>
          <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '4px 0 0 0', color: colors.textPrimary }}>
            {event.type}
          </p>
        </div>

        <div>
          <span style={{ fontSize: '16px', color: colors.textSecondary }}>Status:</span>
          <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '4px 0 0 0', color: colors.success }}>
            {event.status || 'Active'}
          </p>
        </div>

        <div>
          <span style={{ fontSize: '16px', color: colors.textSecondary }}>Time:</span>
          <p style={{ fontSize: '20px', margin: '4px 0 0 0', color: colors.textPrimary }}>
            {event.timestamp || 'Just now'}
          </p>
        </div>

        <div>
          <span style={{ fontSize: '16px', color: colors.textSecondary }}>Location:</span>
          <p style={{ fontSize: '20px', margin: '4px 0 0 0', color: colors.textPrimary }}>
            {event.locationAvailable ? 'Available' : 'Unavailable'}
          </p>
        </div>
      </div>

      <ElderButton title="Close" onClick={() => onNavigate('Home')} variant="primary" />
    </div>
  );
}
