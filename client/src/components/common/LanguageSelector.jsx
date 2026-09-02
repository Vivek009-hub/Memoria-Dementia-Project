/**
 * LanguageSelector.jsx — Reusable, Elderly-Friendly Language Selector Component
 */

import React from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';
import { Globe, Check } from 'lucide-react';

export function LanguageSelector({ variant = 'dropdown', className = '' }) {
  const { currentLanguage, supportedLanguages, changeLanguage, t, isRTL } = useLanguage();

  if (variant === 'grid') {
    return (
      <div className={`space-y-4 ${className}`}>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
          {t('profile.preferred_language', 'Preferred Language')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
          {supportedLanguages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-semibold shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="text-base font-bold">{lang.nativeName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</div>
                </div>
                {isSelected && <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`}>
      <div className="flex items-center gap-2">
        <Globe className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <select
          value={currentLanguage}
          onChange={(e) => changeLanguage(e.target.value)}
          aria-label={t('profile.preferred_language', 'Preferred Language')}
          className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
        >
          {supportedLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
