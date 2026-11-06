/**
 * Accent color presets for the Topbar's single theme picker — six flat
 * colors plus six two-color gradient combos, matching the reference swatch
 * list (Orange, Blue, Green, Red, Purple, Maroon, Grey, then paired
 * combos). Selecting one drives `theme.palette.primary` (see theme.js's
 * getTheme) and, for gradient presets, the active-nav-item background in
 * Sidebar.jsx.
 *
 * Each preset also carries its own `secondary` / `panelGradient` — the
 * color used for dark surfaces (Sidebar's collapsed dark state,
 * AmountPayableCard's dark summary panel). Every existing preset keeps the
 * original navy (`#1F2A3C` / `#1B2437` → `#2A3750`) so picking Orange looks
 * exactly as it always has; `grey` and the `orange-grey` combo use a neutral
 * charcoal panel to match their light grey (`#B5BBC3`) accent.
 */
const NAVY_SECONDARY = "#1F2A3C";
// Slightly lightened vs. NAVY_SECONDARY so the Amount Payable card (the only
// thing that reads panelGradient) doesn't read as quite so dark.
const NAVY_PANEL_GRADIENT = ["#3D4555", "#414A59", "#4A556A"];

const GREY_SECONDARY = "#2B2F36";
const GREY_PANEL_GRADIENT = ["#45474C", "#4B4E54", "#585C63"];

export const ACCENT_THEMES = [
  {
    key: "orange",
    label: "Orange",
    kind: "solid",
    colors: ["#F26B21"],
    secondary: NAVY_SECONDARY,
    panelGradient: NAVY_PANEL_GRADIENT,
  },
  {
    key: "blue",
    label: "Blue",
    kind: "solid",
    colors: ["#2563EB"],
    secondary: NAVY_SECONDARY,
    panelGradient: NAVY_PANEL_GRADIENT,
  },
  {
    key: "green",
    label: "Green",
    kind: "solid",
    colors: ["#22A06B"],
    secondary: NAVY_SECONDARY,
    panelGradient: NAVY_PANEL_GRADIENT,
  },
  {
    key: "red",
    label: "Red",
    kind: "solid",
    colors: ["#E5484D"],
    secondary: NAVY_SECONDARY,
    panelGradient: NAVY_PANEL_GRADIENT,
  },
  {
    key: "purple",
    label: "Purple",
    kind: "solid",
    colors: ["#8B5CF6"],
    secondary: NAVY_SECONDARY,
    panelGradient: NAVY_PANEL_GRADIENT,
  },
  {
    key: "maroon",
    label: "Maroon",
    kind: "solid",
    colors: ["#7A1F2B"],
    secondary: NAVY_SECONDARY,
    panelGradient: NAVY_PANEL_GRADIENT,
  },
  {
    key: "grey",
    label: "Grey",
    kind: "solid",
    colors: ["#B5BBC3"],
    secondary: GREY_SECONDARY,
    panelGradient: GREY_PANEL_GRADIENT,
  },
  {
    key: "orange-purple",
    label: "Orange + Purple",
    kind: "gradient",
    colors: ["#F26B21", "#8B5CF6"],
    secondary: NAVY_SECONDARY,
    panelGradient: NAVY_PANEL_GRADIENT,
  },
  {
    key: "orange-grey",
    label: "Orange + Grey",
    kind: "gradient",
    colors: ["#F26B21", "#B5BBC3"],
    secondary: GREY_SECONDARY,
    panelGradient: GREY_PANEL_GRADIENT,
  },
  {
    key: "blue-green",
    label: "Blue + Green",
    kind: "gradient",
    colors: ["#2563EB", "#22A06B"],
    secondary: NAVY_SECONDARY,
    panelGradient: NAVY_PANEL_GRADIENT,
  },
  {
    key: "purple-orange",
    label: "Purple + Orange",
    kind: "gradient",
    colors: ["#8B5CF6", "#F26B21"],
    secondary: NAVY_SECONDARY,
    panelGradient: NAVY_PANEL_GRADIENT,
  },
  {
    key: "red-blue",
    label: "Red + Blue",
    kind: "gradient",
    colors: ["#E5484D", "#2563EB"],
    secondary: NAVY_SECONDARY,
    panelGradient: NAVY_PANEL_GRADIENT,
  },
  {
    key: "red-maroon",
    label: "Red + Maroon",
    kind: "gradient",
    colors: ["#E5484D", "#7A1F2B"],
    secondary: NAVY_SECONDARY,
    panelGradient: NAVY_PANEL_GRADIENT,
  },
  {
    key: "green-purple",
    label: "Green + Purple",
    kind: "gradient",
    colors: ["#22A06B", "#8B5CF6"],
    secondary: NAVY_SECONDARY,
    panelGradient: NAVY_PANEL_GRADIENT,
  },
];

export const DEFAULT_ACCENT_KEY = "orange";

export function getAccentTheme(key) {
  return (
    ACCENT_THEMES.find((t) => t.key === key) ||
    ACCENT_THEMES.find((t) => t.key === DEFAULT_ACCENT_KEY)
  );
}

// CSS `background` value for a swatch dot or a themed surface: a flat color
// for "solid" presets, a 135deg two-stop gradient for "gradient" presets.
export function accentCssBackground(accent) {
  if (accent.kind === "gradient") {
    return `linear-gradient(135deg, ${accent.colors[0]} 0%, ${accent.colors[1]} 100%)`;
  }
  return accent.colors[0];
}
