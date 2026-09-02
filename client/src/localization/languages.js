/**
 * languages.js — Central Language Configuration for Memora Web Client
 */

export const SUPPORTED_LANGUAGES = [
  // Core Indian Languages
  { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', script: 'latin', uiSupported: true, aiSupported: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', direction: 'ltr', script: 'devanagari', uiSupported: true, aiSupported: true },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', direction: 'ltr', script: 'bengali', uiSupported: true, aiSupported: true },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', direction: 'ltr', script: 'devanagari', uiSupported: true, aiSupported: true },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', direction: 'ltr', script: 'tamil', uiSupported: true, aiSupported: true },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', direction: 'ltr', script: 'telugu', uiSupported: true, aiSupported: true },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', direction: 'ltr', script: 'gujarati', uiSupported: true, aiSupported: true },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', direction: 'ltr', script: 'gurmukhi', uiSupported: true, aiSupported: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', direction: 'rtl', script: 'arabic', uiSupported: true, aiSupported: true },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', direction: 'ltr', script: 'kannada', uiSupported: true, aiSupported: true },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', direction: 'ltr', script: 'malayalam', uiSupported: true, aiSupported: true },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', direction: 'ltr', script: 'odia', uiSupported: true, aiSupported: true },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', direction: 'ltr', script: 'bengali', uiSupported: true, aiSupported: true },

  // North-East Priority Languages
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', direction: 'ltr', script: 'devanagari', uiSupported: true, aiSupported: false },
  { code: 'kha', name: 'Khasi', nativeName: 'Ka Ktien Khasi', direction: 'ltr', script: 'latin', uiSupported: true, aiSupported: false },
  { code: 'grt', name: 'Garo', nativeName: 'A·chik', direction: 'ltr', script: 'latin', uiSupported: true, aiSupported: false },
  { code: 'mni', name: 'Meitei / Manipuri', nativeName: 'মৈতৈলোন্', direction: 'ltr', script: 'bengali', uiSupported: true, aiSupported: false },
  { code: 'lus', name: 'Mizo', nativeName: 'Mizo ṭawng', direction: 'ltr', script: 'latin', uiSupported: true, aiSupported: false },
  { code: 'trv', name: 'Kokborok', nativeName: 'Kokborok', direction: 'ltr', script: 'latin', uiSupported: true, aiSupported: false },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', direction: 'ltr', script: 'devanagari', uiSupported: true, aiSupported: true },
];

export const DEFAULT_LANGUAGE = 'en';

export function getLanguageMeta(code) {
  if (!code) return SUPPORTED_LANGUAGES[0];
  const norm = code.toLowerCase();
  return SUPPORTED_LANGUAGES.find((l) => l.code === norm) || SUPPORTED_LANGUAGES[0];
}
