import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';

// Language selection lives in redux (features/ui/uiSlice.js, `language`
// field) so it's persisted to localStorage the same way theme/accent/fonts
// are. This module only wires that value into i18next's actual translation
// engine — see the `useSyncLanguage` hook below, mounted once near the app
// root, which calls `i18n.changeLanguage()` whenever redux `language`
// changes (including on first load, to match whatever was persisted).
const LANGUAGE_STORAGE_KEY = 'nexora-language';

function initialLanguage() {
  if (typeof window === 'undefined') return 'en';
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
  } catch {
    return 'en';
  }
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    ta: { translation: ta },
  },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export default i18n;
