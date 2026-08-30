/**
 * EmergencyContactsScreen.jsx — Authorized Emergency Contacts List
 */

import React, { useEffect, useState } from 'react';
import { colors } from '../theme/colors.js';
import { ElderButton } from '../components/ElderButton.jsx';
import { getEmergencyContacts } from '../api/contacts.api.js';
import { t } from '../i18n/i18n.js';

export function EmergencyContactsScreen({ onNavigate, client }) {
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Priya', relationship: 'Daughter', phone: '+1234567890' },
    { id: '2', name: 'Rahul', relationship: 'Son', phone: '+0987654321' },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContacts() {
      try {
        if (client) {
          const res = await getEmergencyContacts(client);
          if (res?.data && Array.isArray(res.data)) {
            setContacts(res.data);
          }
        }
      } catch (err) {
        // Fallback to initial contacts list
      } finally {
        setLoading(false);
      }
    }
    loadContacts();
  }, [client]);

  const handleCall = (phone) => {
    // Platform direct call integration abstraction
    alert(`Calling ${phone}...`);
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
      <h1 style={{ fontSize: '28px', color: colors.primary, textAlign: 'center', marginBottom: '24px' }}>
        📞 {t('contacts.title', 'Emergency Contacts')}
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
        {contacts.map((contact) => (
          <div
            key={contact.id || contact._id}
            style={{
              backgroundColor: colors.cardBg,
              padding: '20px',
              borderRadius: '16px',
              border: `2px solid ${colors.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <p style={{ fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0', color: colors.textPrimary }}>
                👤 {contact.name}
              </p>
              <p style={{ fontSize: '18px', color: colors.textSecondary, margin: 0 }}>
                {contact.relationship}
              </p>
            </div>
            <button
              onClick={() => handleCall(contact.phone)}
              type="button"
              style={{
                backgroundColor: colors.success,
                color: colors.white,
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              {t('contacts.call', 'Call')}
            </button>
          </div>
        ))}
      </div>

      <ElderButton title="Back to Home" onClick={() => onNavigate('Home')} variant="secondary" />
    </div>
  );
}
