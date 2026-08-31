/**
 * Accent color presets for the Topbar's theme picker — six flat colors plus
 * six two-color gradient combos, matching the reference swatch list
 * (Orange, Blue, Green, Red, Purple, Maroon, then paired combos). Selecting
 * one drives `theme.palette.primary` (see theme.js's getTheme) and, for
 * gradient presets, the active-nav-item background in Sidebar.jsx.
 */
export const ACCENT_THEMES = [
  { key: 'orange', label: 'Orange', kind: 'solid', colors: ['#F26B21'] },
  { key: 'blue', label: 'Blue', kind: 'solid', colors: ['#2563EB'] },
  { key: 'green', label: 'Green', kind: 'solid', colors: ['#22A06B'] },
  { key: 'red', label: 'Red', kind: 'solid', colors: ['#E5484D'] },
  { key: 'purple', label: 'Purple', kind: 'solid', colors: ['#8B5CF6'] },
  { key: 'maroon', label: 'Maroon', kind: 'solid', colors: ['#7A1F2B'] },
  { key: 'orange-purple', label: 'Orange + Purple', kind: 'gradient', colors: ['#F26B21', '#8B5CF6'] },
  { key: 'blue-green', label: 'Blue + Green', kind: 'gradient', colors: ['#2563EB', '#22A06B'] },
  { key: 'purple-orange', label: 'Purple + Orange', kind: 'gradient', colors: ['#8B5CF6', '#F26B21'] },
  { key: 'red-blue', label: 'Red + Blue', kind: 'gradient', colors: ['#E5484D', '#2563EB'] },
  { key: 'red-maroon', label: 'Red + Maroon', kind: 'gradient', colors: ['#E5484D', '#7A1F2B'] },
  { key: 'green-purple', label: 'Green + Purple', kind: 'gradient', colors: ['#22A06B', '#8B5CF6'] },
];

export const DEFAULT_ACCENT_KEY = 'orange';

export function getAccentTheme(key) {
  return ACCENT_THEMES.find((t) => t.key === key) || ACCENT_THEMES.find((t) => t.key === DEFAULT_ACCENT_KEY);
}

// CSS `background` value for a swatch dot or a themed surface: a flat color
// for "solid" presets, a 135deg two-stop gradient for "gradient" presets.
export function accentCssBackground(accent) {
  if (accent.kind === 'gradient') {
    return `linear-gradient(135deg, ${accent.colors[0]} 0%, ${accent.colors[1]} 100%)`;
  }
  return accent.colors[0];
}
