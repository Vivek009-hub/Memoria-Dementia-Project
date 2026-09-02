/**
 * LanguageContext.jsx — Canonical Multilingual Context & Provider for Memora Web Client
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageMeta } from '../localization/languages.js';
import * as usersApi from '../api/usersApi.js';
import { useAuth } from './AuthContext.jsx';

import en from '../localization/en.json';
import hi from '../localization/hi.json';
import bn from '../localization/bn.json';
import mr from '../localization/mr.json';
import ta from '../localization/ta.json';
import te from '../localization/te.json';
import gu from '../localization/gu.json';
import pa from '../localization/pa.json';
import ur from '../localization/ur.json';
import kn from '../localization/kn.json';
import as from '../localization/as.json';

const dictionaries = {
  en,
  hi,
  bn,
  mr,
  ta,
  te,
  gu,
  pa,
  ur,
  kn,
  as,
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const getInitialLanguage = () => {
    const saved = localStorage.getItem('memora_language');
    if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
      return saved;
    }
    const browserLang = navigator.language ? navigator.language.split('-')[0] : null;
    if (browserLang && SUPPORTED_LANGUAGES.some((l) => l.code === browserLang)) {
      return browserLang;
    }
    return DEFAULT_LANGUAGE;
  };

  const [currentLanguage, setCurrentLanguage] = useState(getInitialLanguage);

  // Apply HTML direction and lang attribute whenever language changes
  const applyLanguageDOM = useCallback((code) => {
    const meta = getLanguageMeta(code);
    document.documentElement.dir = meta.direction || 'ltr';
    document.documentElement.lang = code;
  }, []);

  // Sync with authenticated user backend preferredLanguage if present
  useEffect(() => {
    if (isAuthenticated && user?.preferredLanguage) {
      if (user.preferredLanguage !== currentLanguage) {
        setCurrentLanguage(user.preferredLanguage);
        localStorage.setItem('memora_language', user.preferredLanguage);
        applyLanguageDOM(user.preferredLanguage);
      }
    } else {
      applyLanguageDOM(currentLanguage);
    }
  }, [isAuthenticated, user?.preferredLanguage, applyLanguageDOM]);

  const changeLanguage = async (newCode) => {
    const normalized = newCode.toLowerCase();
    const meta = getLanguageMeta(normalized);
    setCurrentLanguage(normalized);
    localStorage.setItem('memora_language', normalized);
    applyLanguageDOM(normalized);

    // Sync to backend if authenticated
    if (isAuthenticated) {
      try {
        await usersApi.updateUserProfile({ preferredLanguage: normalized });
      } catch (err) {
        console.error('Failed to sync language preference to backend:', err);
      }
    }
  };

  /**
   * Safe translation lookup with dot notation (e.g. t('nav.dashboard', 'Dashboard'))
   */
  const t = (keyPath, defaultText = '') => {
    const keys = keyPath.split('.');
    let currentDict = dictionaries[currentLanguage] || dictionaries.en;

    for (const key of keys) {
      if (currentDict && currentDict[key] !== undefined) {
        currentDict = currentDict[key];
      } else {
        // Fallback to English dictionary
        let fallbackDict = dictionaries.en;
        for (const fk of keys) {
          if (fallbackDict && fallbackDict[fk] !== undefined) {
            fallbackDict = fallbackDict[fk];
          } else {
            return defaultText || keyPath;
          }
        }
        return typeof fallbackDict === 'string' ? fallbackDict : (defaultText || keyPath);
      }
    }

    return typeof currentDict === 'string' ? currentDict : (defaultText || keyPath);
  };

  const value = {
    currentLanguage,
    languageMeta: getLanguageMeta(currentLanguage),
    supportedLanguages: SUPPORTED_LANGUAGES,
    changeLanguage,
    t,
    isRTL: getLanguageMeta(currentLanguage).direction === 'rtl',
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
