/**
 * LanguageContext.jsx — Mobile Language Context & Synchronization Provider
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { setLocale, getLocale, t, isRTL, SUPPORTED_LANGUAGES, getLanguageMeta } from '../i18n/i18n.js';
import { useAuth } from './AuthContext.jsx';
import { updateUserProfile } from '../api/auth.api.js';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const getInitialLang = () => {
    const saved = localStorage.getItem('memora_mobile_language');
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
    return 'en';
  };

  const [currentLanguage, setCurrentLanguageState] = useState(getInitialLang);

  const applyLang = useCallback((code) => {
    const norm = code ? code.toLowerCase() : 'en';
    setLocale(norm);
    setCurrentLanguageState(norm);
    localStorage.setItem('memora_mobile_language', norm);
    document.documentElement.dir = getLanguageMeta(norm).direction || 'ltr';
    document.documentElement.lang = norm;
  }, []);

  // Sync with authenticated user preferredLanguage from backend
  useEffect(() => {
    if (isAuthenticated && user?.preferredLanguage) {
      if (user.preferredLanguage !== currentLanguage) {
        applyLang(user.preferredLanguage);
      }
    } else {
      applyLang(currentLanguage);
    }
  }, [isAuthenticated, user?.preferredLanguage, applyLang]);

  const changeLanguage = async (newCode) => {
    const norm = newCode.toLowerCase();
    applyLang(norm);

    if (isAuthenticated) {
      try {
        await updateUserProfile({ preferredLanguage: norm });
      } catch (err) {
        console.error('Failed to sync mobile language preference to backend:', err);
      }
    }
  };

  const value = {
    currentLanguage,
    languageMeta: getLanguageMeta(currentLanguage),
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    t,
    isRTL: isRTL(),
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
