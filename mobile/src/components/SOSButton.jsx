/**
 * SOSButton.jsx — Prominent Emergency Action Control
 */

import React from 'react';
import { ElderButton } from './ElderButton.jsx';

export function SOSButton({ onClick, label = '🚨 SOS Emergency', style = {} }) {
  return (
    <ElderButton
      title={label}
      onClick={onClick}
      variant="danger"
      style={{
        fontSize: '26px',
        fontWeight: '800',
        minHeight: '76px',
        backgroundColor: '#DC2626',
        color: '#FFFFFF',
        boxShadow: '0 8px 16px rgba(220, 38, 38, 0.4)',
        ...style,
      }}
    />
  );
}
