/**
 * ElderButton.jsx — Accessible Large Touch Target Button (60px+ height)
 */

import React from 'react';
import { colors } from '../theme/colors.js';
import { typography } from '../theme/typography.js';

export function ElderButton({ title, onClick, variant = 'primary', icon, style = {}, disabled = false }) {
  let bgColor = colors.primary;
  let textColor = colors.white;

  if (variant === 'danger') {
    bgColor = colors.danger;
  } else if (variant === 'success') {
    bgColor = colors.success;
  } else if (variant === 'secondary') {
    bgColor = colors.cardBg;
    textColor = colors.textPrimary;
  }

  const buttonStyle = {
    minHeight: '64px',
    padding: '16px 24px',
    backgroundColor: disabled ? colors.border : bgColor,
    color: textColor,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    borderRadius: '12px',
    border: variant === 'secondary' ? `2px solid ${colors.border}` : 'none',
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
