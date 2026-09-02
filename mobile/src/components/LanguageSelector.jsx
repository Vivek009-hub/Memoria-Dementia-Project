/**
 * LanguageSelector.jsx — Mobile Elderly-Friendly Language Selector Component
 */

import React from 'react';
import { useLanguage } from '../context/LanguageContext.jsx';
import { Globe, Check } from 'lucide-react';

export function LanguageSelector({ className = '' }) {
  const { currentLanguage, supportedLanguages, changeLanguage, t } = useLanguage();

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-semibold text-sm">
        <Globe className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <span>{t('profile.language', 'Preferred Language')}</span>
      </div>

      <div className="grid grid-cols-1 gap-2.5 max-h-72 overflow-y-auto pr-1">
        {supportedLanguages.map((lang) => {
          const isSelected = currentLanguage === lang.code;
          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => changeLanguage(lang.code)}
              className={`flex items-center justify-between p-3.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-semibold shadow-xs'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:border-indigo-300'
              }`}
            >
              <div>
                <span className="text-base font-bold block">{lang.nativeName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{lang.name}</span>
              </div>
              {isSelected && <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
