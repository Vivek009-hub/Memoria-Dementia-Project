/**
 * i18n.js — Mobile Localization Translation Engine & Registry
 */

import en from './en.json';
import hi from './hi.json';
import bn from './bn.json';
import as from './as.json';
import ta from './ta.json';
import ur from './ur.json';
import mr from './mr.json';
import te from './te.json';
import gu from './gu.json';
import pa from './pa.json';
import kn from './kn.json';
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, getLanguageMeta } from './languages.js';

const dictionaries = {
  en,
  hi,
  bn,
  as,
  ta,
  ur,
  mr,
  te,
  gu,
  pa,
  kn,
};

let currentLocale = DEFAULT_LANGUAGE;

export function setLocale(locale) {
  if (locale && typeof locale === 'string') {
    const norm = locale.toLowerCase();
    currentLocale = norm;
  }
}

export function getLocale() {
  return currentLocale;
}

export function isRTL() {
  return getLanguageMeta(currentLocale).direction === 'rtl';
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

export { SUPPORTED_LANGUAGES, getLanguageMeta };
