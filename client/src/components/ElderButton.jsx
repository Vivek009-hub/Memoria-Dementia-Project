/**
 * ElderButton.jsx — Accessible Large Touch Target Button (60px+ height)
 */

import React from 'react';

export function ElderButton({ title, onClick, variant = 'primary', icon, style = {}, disabled = false }) {
  let bgColor = '#4F46E5'; // primary
  let textColor = '#FFFFFF';

  if (variant === 'danger') {
    bgColor = '#DC2626';
  } else if (variant === 'success') {
    bgColor = '#059669';
  } else if (variant === 'secondary') {
    bgColor = '#0F172A';
    textColor = '#F8FAFC';
  }

  const buttonStyle = {
    minHeight: '64px',
    padding: '16px 24px',
    backgroundColor: disabled ? '#334155' : bgColor,
    color: textColor,
    fontSize: '18px',
    fontWeight: '800',
    borderRadius: '16px',
    border: variant === 'secondary' ? '2px solid #334155' : 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    width: '100%',
    textAlign: 'center',
    ...style,
  };

  return (
    <button style={buttonStyle} onClick={onClick} disabled={disabled} type="button">
      {icon && <span style={{ fontSize: '24px' }}>{icon}</span>}
      <span>{title}</span>
    </button>
  );
}
