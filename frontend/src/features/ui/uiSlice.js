import { createSlice, nanoid } from '@reduxjs/toolkit';
import { ACCENT_THEMES, DEFAULT_ACCENT_KEY } from '../../theme/accentThemes';

const THEME_STORAGE_KEY = 'nexora-theme-mode';
const ACCENT_THEME_STORAGE_KEY = 'nexora-accent-theme';
const SIDEBAR_FONT_STORAGE_KEY = 'nexora-sidebar-font';
const BODY_FONT_STORAGE_KEY = 'nexora-body-font';
const SIDEBAR_FONT_STYLE_STORAGE_KEY = 'nexora-sidebar-font-style';
const BODY_FONT_STYLE_STORAGE_KEY = 'nexora-body-font-style';
const LANGUAGE_STORAGE_KEY = 'nexora-language';
const MAX_OPEN_TABS_STORAGE_KEY = 'nexora-max-open-tabs';
const SIDEBAR_ICON_COLORS_STORAGE_KEY = 'nexora-sidebar-icon-colors';
const SIDEBAR_ANIMATIONS_STORAGE_KEY = 'nexora-sidebar-animations';
const EMAIL_BUTTON_STORAGE_KEY = 'nexora-email-button';
const WHATSAPP_BUTTON_STORAGE_KEY = 'nexora-whatsapp-button';

// Hard ceiling the slider can't exceed — tabsSlice.js enforces this same
// number regardless of what's stored, so a corrupted/tampered localStorage
// value can never push the cap past it.
export const MAX_OPEN_TABS_CEILING = 10;

export const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Nunito Sans', label: 'Nunito Sans' },
  { value: 'Source Sans 3', label: 'Source Sans Pro' },
];

// The language switcher (Topbar's globe/translate icon) offers exactly
// these three — English, Tamil, Hindi — matching the translations shipped
// in src/i18n/locales/*.json. Add a locale file and an entry here together
// if another language is ever needed.
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'தமிழ் (Tamil)' },
  { value: 'hi', label: 'हिन्दी (Hindi)' },
];

const DEFAULT_FONT = 'Inter';
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_MAX_OPEN_TABS = 10;
const DEFAULT_FONT_STYLE = { bold: false, italic: false, underline: false };

function readStoredJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) return fallback;
    return { ...fallback, ...JSON.parse(stored) };
  } catch {
    return fallback;
  }
}

function persistJson(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore write failures (e.g. private browsing storage restrictions).
  }
}

function readStoredValue(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    return window.localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function persistValue(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore write failures (e.g. private browsing storage restrictions).
  }
}

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

function readStoredSidebarIconColorsEnabled() {
  if (typeof window === 'undefined') return true;
  try {
    const stored = window.localStorage.getItem(SIDEBAR_ICON_COLORS_STORAGE_KEY);
    // Default ON — absent key (first run, or storage blocked) means colors show.
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

function persistSidebarIconColorsEnabled(enabled) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SIDEBAR_ICON_COLORS_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore write failures (e.g. private browsing storage restrictions).
  }
}

function readStoredSidebarAnimationsEnabled() {
  if (typeof window === 'undefined') return true;
  try {
    const stored = window.localStorage.getItem(SIDEBAR_ANIMATIONS_STORAGE_KEY);
    // Default ON — absent key (first run, or storage blocked) means the
    // entrance/hover/3D animations play.
    return stored === null ? true : stored === 'true';
  } catch {
    return true;
  }
}

function persistSidebarAnimationsEnabled(enabled) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SIDEBAR_ANIMATIONS_STORAGE_KEY, String(enabled));
  } catch {
    // Ignore write failures (e.g. private browsing storage restrictions).
  }
}

// The Email / WhatsApp buttons (all pages) are opt-in: default OFF, so an absent
// key (first run, or storage blocked) keeps them hidden.
function readStoredFlag(key) {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

function persistFlag(key, enabled) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, String(enabled));
  } catch {
    // Ignore write failures (e.g. private browsing storage restrictions).
  }
}

function readStoredMaxOpenTabs() {
  if (typeof window === 'undefined') return DEFAULT_MAX_OPEN_TABS;
  try {
    const stored = Number(window.localStorage.getItem(MAX_OPEN_TABS_STORAGE_KEY));
    return Number.isFinite(stored) && stored >= 1 && stored <= MAX_OPEN_TABS_CEILING ? stored : DEFAULT_MAX_OPEN_TABS;
  } catch {
    return DEFAULT_MAX_OPEN_TABS;
  }
}

const initialState = {
  toast: null, // { id, message, severity }
  sidebarOpen: true, // desktop: expanded vs icon rail. mobile: drawer open/closed.
  themeMode: readStoredThemeMode(), // 'light' | 'dark'
  accentThemeKey: readStoredAccentThemeKey(), // key into ACCENT_THEMES (solid color or gradient combo)
  sidebarFont: readStoredValue(SIDEBAR_FONT_STORAGE_KEY, DEFAULT_FONT),
  bodyFont: readStoredValue(BODY_FONT_STORAGE_KEY, DEFAULT_FONT),
  sidebarFontStyle: readStoredJson(SIDEBAR_FONT_STYLE_STORAGE_KEY, DEFAULT_FONT_STYLE),
  bodyFontStyle: readStoredJson(BODY_FONT_STYLE_STORAGE_KEY, DEFAULT_FONT_STYLE),
  language: readStoredValue(LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE),
  maxOpenTabs: readStoredMaxOpenTabs(),
  sidebarIconColorsEnabled: readStoredSidebarIconColorsEnabled(), // each sidebar menu's icon shows its own unique color when true
  emailButtonEnabled: readStoredFlag(EMAIL_BUTTON_STORAGE_KEY), // show the Email button on every page that offers it
  whatsappButtonEnabled: readStoredFlag(WHATSAPP_BUTTON_STORAGE_KEY), // show the WhatsApp button on every page that offers it
  sidebarAnimationsEnabled: readStoredSidebarAnimationsEnabled(), // entrance stagger, 3D hover tilt, and active transitions on the sidebar menus
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showToast: {
      reducer(state, action) {
        state.toast = action.payload;
      },
      // `options` (optional): { duration: ms before auto-hide (default 4000),
      // closable: false hides the close (x) button }.
      prepare(message, severity = 'info', options = {}) {
        return { payload: { id: nanoid(), message, severity, ...options } };
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
    setSidebarFont(state, action) {
      state.sidebarFont = action.payload || DEFAULT_FONT;
      persistValue(SIDEBAR_FONT_STORAGE_KEY, state.sidebarFont);
    },
    setBodyFont(state, action) {
      state.bodyFont = action.payload || DEFAULT_FONT;
      persistValue(BODY_FONT_STORAGE_KEY, state.bodyFont);
    },
    toggleSidebarFontStyle(state, action) {
      const key = action.payload;
      state.sidebarFontStyle[key] = !state.sidebarFontStyle[key];
      persistJson(SIDEBAR_FONT_STYLE_STORAGE_KEY, state.sidebarFontStyle);
    },
    toggleBodyFontStyle(state, action) {
      const key = action.payload;
      state.bodyFontStyle[key] = !state.bodyFontStyle[key];
      persistJson(BODY_FONT_STYLE_STORAGE_KEY, state.bodyFontStyle);
    },
    setLanguage(state, action) {
      state.language = action.payload || DEFAULT_LANGUAGE;
      persistValue(LANGUAGE_STORAGE_KEY, state.language);
    },
    setMaxOpenTabs(state, action) {
      const value = Number(action.payload);
      state.maxOpenTabs = Number.isFinite(value)
        ? Math.min(MAX_OPEN_TABS_CEILING, Math.max(1, value))
        : DEFAULT_MAX_OPEN_TABS;
      persistValue(MAX_OPEN_TABS_STORAGE_KEY, String(state.maxOpenTabs));
    },
    setSidebarIconColorsEnabled(state, action) {
      state.sidebarIconColorsEnabled = Boolean(action.payload);
      persistSidebarIconColorsEnabled(state.sidebarIconColorsEnabled);
    },
    setEmailButtonEnabled(state, action) {
      state.emailButtonEnabled = Boolean(action.payload);
      persistFlag(EMAIL_BUTTON_STORAGE_KEY, state.emailButtonEnabled);
    },
    setWhatsappButtonEnabled(state, action) {
      state.whatsappButtonEnabled = Boolean(action.payload);
      persistFlag(WHATSAPP_BUTTON_STORAGE_KEY, state.whatsappButtonEnabled);
    },
    setSidebarAnimationsEnabled(state, action) {
      state.sidebarAnimationsEnabled = Boolean(action.payload);
      persistSidebarAnimationsEnabled(state.sidebarAnimationsEnabled);
    },
  },
});

export const {
  showToast, clearToast, toggleSidebar, setSidebarOpen, toggleThemeMode, setThemeMode, setAccentTheme,
  setSidebarFont, setBodyFont, toggleSidebarFontStyle, toggleBodyFontStyle, setLanguage, setMaxOpenTabs,
  setSidebarIconColorsEnabled, setSidebarAnimationsEnabled, setEmailButtonEnabled, setWhatsappButtonEnabled,
} = uiSlice.actions;
export default uiSlice.reducer;

export const selectToast = (state) => state.ui.toast;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectThemeMode = (state) => state.ui.themeMode;
export const selectAccentThemeKey = (state) => state.ui.accentThemeKey;
export const selectSidebarFont = (state) => state.ui.sidebarFont;
export const selectBodyFont = (state) => state.ui.bodyFont;
export const selectSidebarFontStyle = (state) => state.ui.sidebarFontStyle;
export const selectBodyFontStyle = (state) => state.ui.bodyFontStyle;
export const selectLanguage = (state) => state.ui.language;
export const selectMaxOpenTabs = (state) => state.ui.maxOpenTabs;
export const selectSidebarIconColorsEnabled = (state) => state.ui.sidebarIconColorsEnabled;
export const selectEmailButtonEnabled = (state) => state.ui.emailButtonEnabled;
export const selectWhatsappButtonEnabled = (state) => state.ui.whatsappButtonEnabled;
export const selectSidebarAnimationsEnabled = (state) => state.ui.sidebarAnimationsEnabled;
