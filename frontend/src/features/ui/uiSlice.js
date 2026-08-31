import { createSlice, nanoid } from '@reduxjs/toolkit';
import { ACCENT_THEMES, DEFAULT_ACCENT_KEY } from '../../theme/accentThemes';

const THEME_STORAGE_KEY = 'nexora-theme-mode';
const ACCENT_THEME_STORAGE_KEY = 'nexora-accent-theme';

function readStoredThemeMode() {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

function persistThemeMode(mode) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    // Ignore write failures (e.g. private browsing storage restrictions).
  }
}

function readStoredAccentThemeKey() {
  if (typeof window === 'undefined') return DEFAULT_ACCENT_KEY;
  try {
    const stored = window.localStorage.getItem(ACCENT_THEME_STORAGE_KEY);
    return ACCENT_THEMES.some((t) => t.key === stored) ? stored : DEFAULT_ACCENT_KEY;
  } catch {
    return DEFAULT_ACCENT_KEY;
  }
}

function persistAccentThemeKey(key) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ACCENT_THEME_STORAGE_KEY, key);
  } catch {
    // Ignore write failures (e.g. private browsing storage restrictions).
  }
}

const initialState = {
  toast: null, // { id, message, severity }
  sidebarOpen: true, // desktop: expanded vs icon rail. mobile: drawer open/closed.
  themeMode: readStoredThemeMode(), // 'light' | 'dark'
  accentThemeKey: readStoredAccentThemeKey(), // key into ACCENT_THEMES (solid color or gradient combo)
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: {
      reducer(state, action) {
        state.toast = action.payload;
      },
      prepare(message, severity = 'info') {
        return { payload: { id: nanoid(), message, severity } };
      },
    },
    clearToast(state) {
      state.toast = null;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen(state, action) {
      state.sidebarOpen = action.payload;
    },
    toggleThemeMode(state) {
      state.themeMode = state.themeMode === 'dark' ? 'light' : 'dark';
      persistThemeMode(state.themeMode);
    },
    setThemeMode(state, action) {
      state.themeMode = action.payload === 'dark' ? 'dark' : 'light';
      persistThemeMode(state.themeMode);
    },
    setAccentTheme(state, action) {
      const key = ACCENT_THEMES.some((t) => t.key === action.payload) ? action.payload : DEFAULT_ACCENT_KEY;
      state.accentThemeKey = key;
      persistAccentThemeKey(key);
    },
  },
});

export const {
  showToast, clearToast, toggleSidebar, setSidebarOpen, toggleThemeMode, setThemeMode, setAccentTheme,
} = uiSlice.actions;
export default uiSlice.reducer;

export const selectToast = (state) => state.ui.toast;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectThemeMode = (state) => state.ui.themeMode;
export const selectAccentThemeKey = (state) => state.ui.accentThemeKey;
