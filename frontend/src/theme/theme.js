import { createTheme, lighten, darken } from '@mui/material/styles';
import { getAccentTheme, DEFAULT_ACCENT_KEY } from './accentThemes';

// Palette sampled from the Nexora POS reference screens: orange brand
// accent, dark slate sidebar, light neutral background. `getTheme(mode,
// accentKey)` builds the same shape/typography/component overrides for
// either a 'light' or 'dark' MUI palette, with `primary` swapped in from
// the selected ACCENT_THEMES preset — so the whole app can switch both
// light/dark mode and accent color at runtime (see uiSlice's `themeMode` /
// `accentThemeKey` + Topbar's pickers).
const SHARED = {
  success: { main: '#22A06B' },
  warning: { main: '#F5A623' },
  error: { main: '#E5484D' },
};

function buildPalette(mode, accentKey) {
  const accent = getAccentTheme(accentKey);
  // For a gradient preset there's no single "main" MUI can use for solid
  // surfaces (buttons, focus rings, links) — fall back to its first color.
  const primaryMain = accent.colors[0];

  return {
    mode,
    ...SHARED,
    primary: { main: primaryMain, contrastText: '#FFFFFF' },
    // Dark-surface color (Sidebar's collapsed dark state, etc.) travels
    // with the selected accent preset itself — see accent.secondary in
    // accentThemes.js — rather than a separate picker.
    secondary: { main: accent.secondary },
    background: mode === 'dark'
      ? { default: '#12161F', paper: '#1A1F2B' }
      : { default: '#F5F6F8', paper: '#FFFFFF' },
    text: mode === 'dark'
      ? { primary: '#F3F4F6', secondary: '#9CA3AF' }
      : { primary: '#1F2A3C', secondary: '#6B7280' },
    divider: mode === 'dark' ? '#2B3141' : '#E5E7EB',
  };
}

export function getTheme(mode = 'light', accentKey = DEFAULT_ACCENT_KEY, bodyFont = 'Inter', bodyFontStyle = {}) {
  const isDark = mode === 'dark';
  const scrollbarThumb = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.22)';
  const scrollbarThumbHover = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';

  const accent = getAccentTheme(accentKey);

  return createTheme({
    palette: buildPalette(mode === 'dark' ? 'dark' : 'light', accentKey),
    // Dark-panel gradient stops for the Amount Payable summary card etc.
    // (read as `theme.panelGradient` — see AmountPayableCard.jsx), swapped
    // by the selected accent preset's own `panelGradient`.
    panelGradient: accent.panelGradient,
    shape: {
      borderRadius: 10,
    },
    // MUI's default durations (standard: 300ms, etc.) read as too snappy for
    // this app's menus/drawers/popovers/tooltips — scaled up ~1.5x across
    // the board so open/close animations feel smoother instead of instant.
    transitions: {
      duration: {
        shortest: 220,
        shorter: 280,
        short: 320,
        standard: 400,
        complex: 480,
        enteringScreen: 320,
        leavingScreen: 260,
      },
    },
    typography: {
      fontFamily: [`"${bodyFont}"`, '"Inter"', '"Roboto"', '"Helvetica"', '"Arial"', 'sans-serif'].join(','),
      allVariants: {
        ...(bodyFontStyle.bold ? { fontWeight: 700 } : null),
        ...(bodyFontStyle.italic ? { fontStyle: 'italic' } : null),
        ...(bodyFontStyle.underline ? { textDecoration: 'underline' } : null),
      },
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 8, paddingTop: 10, paddingBottom: 10 },
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiSelect: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          // The 'orange-grey' combo also gets a soft light-blue fill on
          // every outlined input (search / autocomplete fields on the Line
          // Sale bar, etc.) instead of the plain paper background, to match
          // that theme's light-blue table header below.
          root: ({ theme }) => ({
            borderRadius: 8,
            ...(accentKey === 'orange-grey'
              ? { backgroundColor: theme.palette.mode === 'dark' ? 'rgba(66,133,244,0.10)' : '#F3F8FF' }
              : null),
          }),
          input: { paddingTop: 10, paddingBottom: 10 },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: { fontSize: 14 },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      // App-wide data-table header: an opaque tint of the selected accent
      // color (opaque so a sticky header / sticky column never shows rows
      // scrolling underneath). The nested selector out-specifies the
      // per-table `sx` overrides (color: 'text.secondary', ...) so every
      // table picks it up without editing each one.
      //
      // The 'orange-grey' combo breaks from the primary-color tint on
      // purpose — a flat grey header with plain black text, per request,
      // instead of an orange-tinted one.
      MuiTableHead: {
        styleOverrides: {
          root: ({ theme }) => (accentKey === 'orange-grey'
            ? {
              '& .MuiTableCell-head': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(66,133,244,0.14)' : '#F3F8FF',
                color: theme.palette.mode === 'dark' ? '#AFCBFA' : '#1D4E89',
                fontWeight: 700,
                borderBottom: '2px solid #CFE4FF',
              },
            }
            : {
              '& .MuiTableCell-head': {
                backgroundColor: theme.palette.mode === 'dark'
                  ? darken(theme.palette.primary.main, 0.65)
                  : lighten(theme.palette.primary.main, 0.88),
                color: theme.palette.mode === 'dark'
                  ? lighten(theme.palette.primary.main, 0.7)
                  : darken(theme.palette.primary.main, 0.45),
                fontWeight: 700,
                borderBottom: `2px solid ${theme.palette.primary.main}`,
              },
            }),
        },
      },
      // App-wide thin scrollbar — covers every scrollable table container,
      // the dashboard panels, etc. (the sidebar keeps its own copy of this
      // since it needs a fixed light-on-dark thumb regardless of mode).
      MuiCssBaseline: {
        styleOverrides: {
          '*': {
            scrollbarWidth: 'thin',
            scrollbarColor: `${scrollbarThumb} transparent`,
          },
          '*::-webkit-scrollbar': { width: 6, height: 6 },
          '*::-webkit-scrollbar-track': { background: 'transparent' },
          '*::-webkit-scrollbar-button': { display: 'none', height: 0, width: 0 },
          '*::-webkit-scrollbar-thumb': { backgroundColor: scrollbarThumb, borderRadius: 4 },
          '*::-webkit-scrollbar-thumb:hover': { backgroundColor: scrollbarThumbHover },
          // Frozen "Action" column — tag the header + body cell of a table's
          // action column with className="sticky-action" and it stays
          // pinned to the right edge while the rest scrolls horizontally.
          // Opaque backgrounds (paper / hover) so scrolled cells never show
          // through; the header variant is tinted by MuiTableHead above.
          '.sticky-action': {
            position: 'sticky',
            right: 0,
            zIndex: 1,
            backgroundColor: isDark ? '#1A1F2B' : '#FFFFFF',
            boxShadow: `-6px 0 6px -6px ${isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.18)'}`,
          },
          'thead .sticky-action': { zIndex: 3 },
          'tr.MuiTableRow-hover:hover > .sticky-action': {
            backgroundColor: isDark ? '#242B3A' : '#F5F6F8',
          },
        },
      },
    },
  });
}

// Default export kept for any existing static imports — equivalent to
// getTheme('light', 'orange').
export const theme = getTheme('light', DEFAULT_ACCENT_KEY);
