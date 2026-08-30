/**
 * i18n.js — Localization Translation Engine
 */

import en from './en.json';
import hi from './hi.json';

const dictionaries = { en, hi };

let currentLocale = 'en';

export function setLocale(locale) {
  if (dictionaries[locale]) {
    currentLocale = locale;
  }
}

export function getLocale() {
  return currentLocale;
}

export function t(keyPath, defaultText = '') {
  const keys = keyPath.split('.');
  let dict = dictionaries[currentLocale] || dictionaries.en;
  
  for (const k of keys) {
    if (dict && dict[k] !== undefined) {
      dict = dict[k];
    } else {
      // Fallback to English if missing in current locale
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

  return typeof dict === 'string' ? dict : (defaultText || keyPath);
}
