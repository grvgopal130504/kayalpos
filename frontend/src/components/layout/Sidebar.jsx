import { NavLink } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { NAV_SECTIONS } from './navConfig';
import AppLogo from '../common/AppLogo';
import { useAppSelector } from '../../app/hooks';
import {
  selectAccentThemeKey, selectSidebarFont, selectSidebarFontStyle,
  selectSidebarIconColorsEnabled, selectSidebarAnimationsEnabled,
} from '../../features/ui/uiSlice';
import { getAccentTheme, accentCssBackground } from '../../theme/accentThemes';

export const SIDEBAR_WIDTH = 264;
export const SIDEBAR_RAIL_WIDTH = 70;

// Nav item sizing — tweak these to resize every menu row at once instead of
// hunting through the ListItemButton sx below.
// Expanded (icon + label) row sizing.
const NAV_ITEM_HEIGHT = 44;
const NAV_ITEM_PADDING_TOP = 1;
const NAV_ITEM_PADDING_BOTTOM = 1;
const NAV_ITEM_GAP = 0;
// Collapsed (icon-only rail) row sizing — kept as its own set of variables
// so the rail's row height/padding/gap can be tuned independently of the
// expanded view instead of inheriting it. Without their own values here,
// collapsed rows shrink to just the icon's height and look congested.
const NAV_ITEM_HEIGHT_COLLAPSED = 44;
const NAV_ITEM_PADDING_TOP_COLLAPSED = 1;
const NAV_ITEM_PADDING_BOTTOM_COLLAPSED = 1;
const NAV_ITEM_GAP_COLLAPSED = 0;

const NAV_ITEM_RADIUS = 0;

const NAV_ITEM_PADDING_X = 16;
const NAV_ITEM_PADDING_X_COLLAPSED = 12;

const NAV_ICON_WIDTH = 40;
const NAV_ICON_FONT_SIZE = 20;
const NAV_LABEL_FONT_SIZE = 13;

// Entrance animation for the menu list: each row fades and slides in from
// the left, staggered slightly so the sidebar feels like it "builds"
// itself instead of popping in all at once. Delay is capped (see
// STAGGER_CAP below) so a long list doesn't make the last few items wait
// visibly longer than the rest.
const NAV_ITEM_STAGGER_MS = 25;
const NAV_ITEM_STAGGER_CAP = 10;

function NavList({ collapsed, onNavigate, activeBackground, sidebarFont, sidebarFontStyle, isDark, iconColorsEnabled, animationsEnabled }) {
  const itemColor = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.82)';
  const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'divider';
  const scrollbarThumb = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';
  const scrollbarThumbHover = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';

  let itemIndex = 0;

  return (
    <Box
      sx={{
        overflowY: 'auto',
        flex: 1,
        py: 1,
        // Slim, low-profile scrollbar instead of the browser's default
        // full-size track + arrow buttons, which look oversized against the
        // narrow sidebar.
        scrollbarWidth: 'thin',
        scrollbarColor: `${scrollbarThumb} transparent`,
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-button': { display: 'none', height: 0, width: 0 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: scrollbarThumb,
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb:hover': { backgroundColor: scrollbarThumbHover },
        // 3D flip-down entrance: each row rotates in around its own top
        // edge (like a flap opening) rather than a flat fade/slide.
        // `perspective()` is baked into the transform itself so no
        // ancestor `perspective`/`transform-style` is needed. Only defined/
        // used when animationsEnabled is true (see Settings > Sidebar
        // Animations toggle) — otherwise rows render in their final state
        // immediately with no hover tilt either.
        ...(animationsEnabled && {
          '@keyframes navItemIn': {
            '0%': { opacity: 0, transform: 'perspective(700px) rotateX(-65deg) translateY(-6px)' },
            '100%': { opacity: 1, transform: 'perspective(700px) rotateX(0deg) translateY(0)' },
          },
        }),
      }}
    >
      {NAV_SECTIONS.map((section, sectionIndex) => (
        <Box key={section.key}>
          {sectionIndex > 0 && <Divider sx={{ borderColor: dividerColor, my: 1, mx: 2 }} />}
          <List disablePadding sx={{ px: 1.25 }}>
            {section.items.map((item) => {
              const Icon = item.icon;
              const delayIndex = Math.min(itemIndex, NAV_ITEM_STAGGER_CAP);
              itemIndex += 1;
              const button = (
                <ListItemButton
                  key={item.key}
                  component={NavLink}
                  to={item.path}
                  onClick={onNavigate}
                  sx={{
                    borderRadius: `${NAV_ITEM_RADIUS}px`,
                    mb: `${collapsed ? NAV_ITEM_GAP_COLLAPSED : NAV_ITEM_GAP}px`,
                    minHeight: collapsed ? NAV_ITEM_HEIGHT_COLLAPSED : NAV_ITEM_HEIGHT,
                    pt: `${collapsed ? NAV_ITEM_PADDING_TOP_COLLAPSED : NAV_ITEM_PADDING_TOP}px`,
                    pb: `${collapsed ? NAV_ITEM_PADDING_BOTTOM_COLLAPSED : NAV_ITEM_PADDING_BOTTOM}px`,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: `${collapsed ? NAV_ITEM_PADDING_X_COLLAPSED : NAV_ITEM_PADDING_X}px`,
                    color: itemColor,
                    position: 'relative',
                    transformOrigin: 'left center',
                    ...(animationsEnabled && {
                      animation: 'navItemIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both',
                      animationDelay: `${delayIndex * NAV_ITEM_STAGGER_MS}ms`,
                    }),
                    transition: (theme) => theme.transitions.create(
                      ['background-color', 'background', 'color', 'padding-left', 'transform', 'box-shadow'],
                      { duration: 220, easing: theme.transitions.easing.easeOut },
                    ),
                    '& .MuiListItemIcon-root svg': {
                      transition: (theme) => theme.transitions.create(['transform', 'color'], { duration: 220, easing: theme.transitions.easing.easeOut }),
                      transformStyle: 'preserve-3d',
                      // Each menu's own color (see navConfig.js), only while
                      // the item isn't active — the active state below wins
                      // on specificity and always shows white instead.
                      ...(iconColorsEnabled && item.color ? { color: item.color } : {}),
                    },
                    '&.active': {
                      background: activeBackground,
                      color: '#fff',
                      transform: animationsEnabled ? 'perspective(700px) translateZ(4px)' : 'none',
                      boxShadow: animationsEnabled ? (isDark ? '0 4px 12px rgba(0,0,0,0.5)' : '0 4px 12px rgba(0,0,0,0.18)') : 'none',
                      '& .MuiListItemIcon-root': { color: '#fff' },
                    },
                    '&.active .MuiListItemIcon-root svg': { color: '#fff' },
                    // A slim indicator bar that grows in from the left edge
                    // when a menu item becomes active, instead of the
                    // background simply appearing.
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '20%',
                      bottom: '20%',
                      width: 3,
                      borderRadius: '0 4px 4px 0',
                      bgcolor: '#fff',
                      opacity: 0,
                      transform: 'scaleY(0)',
                      transition: (theme) => theme.transitions.create(['opacity', 'transform'], { duration: 200 }),
                    },
                    '&.active::before': { opacity: 0.85, transform: 'scaleY(1)' },
                    // Hover tilts the whole row back in 3D space (like a
                    // card lifting off the sidebar) around its left edge,
                    // with a shadow that fades in to sell the depth.
                    '&:hover': {
                      bgcolor: hoverBg,
                      pl: collapsed ? `${NAV_ITEM_PADDING_X_COLLAPSED}px` : `${NAV_ITEM_PADDING_X + 4}px`,
                      transform: animationsEnabled ? 'perspective(700px) rotateY(-9deg) translateZ(8px) scale(1.015)' : 'none',
                      boxShadow: animationsEnabled ? (isDark ? '6px 8px 18px rgba(0,0,0,0.5)' : '6px 8px 18px rgba(0,0,0,0.16)') : 'none',
                      '& .MuiListItemIcon-root svg': { transform: animationsEnabled ? 'scale(1.15) rotateY(14deg)' : 'none' },
                    },
                    '&.active:hover': {
                      background: activeBackground,
                      transform: animationsEnabled ? 'perspective(700px) rotateY(-9deg) translateZ(10px) scale(1.015)' : 'none',
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : NAV_ICON_WIDTH,
                      color: 'inherit',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ fontSize: NAV_ICON_FONT_SIZE }} />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          fontSize: NAV_LABEL_FONT_SIZE,
                          fontWeight: sidebarFontStyle?.bold ? 700 : 500,
                          noWrap: true,
                          sx: {
                            fontFamily: `"${sidebarFont}", "Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
                            fontStyle: sidebarFontStyle?.italic ? 'italic' : 'normal',
                            textDecoration: sidebarFontStyle?.underline ? 'underline' : 'none',
                          },
                        },
                      }}
                    />
                  )}
                </ListItemButton>
              );

              return collapsed ? (
                <Tooltip key={item.key} title={item.label} placement="right">
                  {button}
                </Tooltip>
              ) : (
                button
              );
            })}
          </List>
        </Box>
      ))}
    </Box>
  );
}

/**
 * App navigation. `variant="permanent"` renders the always-visible desktop
 * rail/panel; `variant="temporary"` renders the mobile overlay drawer. Both
 * share the same NavList so the menu itself is defined once.
 */
export default function Sidebar({ variant, collapsed = false, open, onClose, onNavigate }) {
  const width = collapsed ? SIDEBAR_RAIL_WIDTH : SIDEBAR_WIDTH;
  const accentThemeKey = useAppSelector(selectAccentThemeKey);
  const sidebarFont = useAppSelector(selectSidebarFont);
  const sidebarFontStyle = useAppSelector(selectSidebarFontStyle);
  const iconColorsEnabled = useAppSelector(selectSidebarIconColorsEnabled);
  const animationsEnabled = useAppSelector(selectSidebarAnimationsEnabled);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  // Solid accent presets already flow into the active nav item via
  // `primary.main` (see theme.js), but MUI's palette can only hold one flat
  // color there — so a gradient preset is applied directly as a CSS
  // background here instead of through the theme.
  const activeBackground = accentCssBackground(getAccentTheme(accentThemeKey));

  const content = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDark ? 'secondary.main' : 'background.paper',
        borderRight: isDark ? 'none' : '1px solid',
        borderColor: 'divider',
        fontFamily: `"${sidebarFont}", "Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          px: collapsed ? 1 : 2.5,
          py: 2.5,
          minHeight: 72,
        }}
      >
        <AppLogo
          iconOnly={collapsed}
          iconSize={collapsed ? 28 : 34}
          titleFontSize="1.05rem"
          subtitleFontSize="0.6rem"
          titleColor={isDark ? '#fff' : 'text.primary'}
          subtitleColor={isDark ? 'rgba(255,255,255,0.65)' : 'text.secondary'}
        />
      </Box>
      <NavList
        collapsed={collapsed}
        onNavigate={onNavigate}
        activeBackground={activeBackground}
        sidebarFont={sidebarFont}
        sidebarFontStyle={sidebarFontStyle}
        isDark={isDark}
        iconColorsEnabled={iconColorsEnabled}
        animationsEnabled={animationsEnabled}
      />
    </Box>
  );

  if (variant === 'temporary') {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', border: 'none' },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width,
        flexShrink: 0,
        transition: (theme) => theme.transitions.create('width', { duration: 450, easing: theme.transitions.easing.easeInOut }),
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          border: 'none',
          transition: (theme) => theme.transitions.create('width', { duration: 450, easing: theme.transitions.easing.easeInOut }),
          overflowX: 'hidden',
        },
      }}
    >
      {content}
    </Drawer>
  );
}
