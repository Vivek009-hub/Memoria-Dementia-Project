/**
 * HomeScreen.jsx — Elder-Friendly Dashboard
 */

import React from 'react';
import { colors } from '../theme/colors.js';
import { ElderButton } from '../components/ElderButton.jsx';
import { SOSButton } from '../components/SOSButton.jsx';
import { t } from '../i18n/i18n.js';

export function HomeScreen({ onNavigate }) {
  return (
    <div
      style={{
        padding: '24px',
        backgroundColor: colors.background,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '28px', color: colors.textPrimary, margin: 0 }}>
          {t('app.greeting', 'Good Morning')}
        </h2>
      </div>

      <ElderButton
        title={t('home.playGame', 'Play Game')}
        onClick={() => onNavigate('Games')}
        variant="primary"
        icon="🧠"
      />

      <ElderButton
        title={t('home.myMemories', 'My Memories')}
        onClick={() => onNavigate('Memories')}
        variant="primary"
        icon="🖼️"
      />

      <ElderButton
        title={t('home.myReminders', 'My Reminders')}
        onClick={() => onNavigate('Reminders')}
        variant="primary"
        icon="🔔"
      />

      <ElderButton
        title={t('home.community', 'Community')}
        onClick={() => onNavigate('Community')}
        variant="primary"
        icon="🫂"
      />

      <ElderButton
        title={t('contacts.title', 'Emergency Contacts')}
        onClick={() => onNavigate('Contacts')}
        variant="secondary"
        icon="📞"
      />

      <div style={{ marginTop: '12px' }}>
        <SOSButton
          label={t('home.sos', 'SOS Emergency')}
          onClick={() => onNavigate('SOS')}
        />
      </div>
    </div>
  );
}
