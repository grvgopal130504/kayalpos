import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import i18n from './index';
import { selectLanguage } from '../features/ui/uiSlice';

/**
 * Keeps i18next's active language in step with redux's `ui.language` (the
 * single source of truth, persisted to localStorage in uiSlice.js). Mount
 * this once near the app root, inside <Provider>, alongside the theme
 * provider — same pattern as AppThemeProvider reacting to themeMode/accent.
 */
export default function useSyncLanguage() {
  const language = useSelector(selectLanguage);

  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language]);
}
