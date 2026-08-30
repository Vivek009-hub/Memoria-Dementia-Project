/**
 * HeaderBar.jsx — Simple Header with App Title, Network Status & Language Switcher
 */

import React from 'react';
import { colors } from '../theme/colors.js';
import { getLocale, setLocale } from '../i18n/i18n.js';

export function HeaderBar({ title = 'Memora', onLanguageChange }) {
  const currentLang = getLocale();

  const handleToggleLang = () => {
    const nextLang = currentLang === 'en' ? 'hi' : 'en';
    setLocale(nextLang);
    if (onLanguageChange) onLanguageChange(nextLang);
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        backgroundColor: colors.primary,
        color: colors.white,
      }}
    >
      <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>{title}</h1>
      <button
        onClick={handleToggleLang}
        type="button"
        style={{
          padding: '8px 16px',
          borderRadius: '8px',
          border: '2px solid white',
          backgroundColor: 'transparent',
          color: colors.white,
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        {currentLang === 'en' ? 'हिन्दी' : 'English'}
      </button>
    </header>
  );
}
