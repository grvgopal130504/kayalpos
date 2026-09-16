import { NavLink } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavSections } from './navConfig';
import AppLogo from '../common/AppLogo';
import { useAppSelector } from '../../app/hooks';
import { selectAccentThemeKey, selectSidebarFont, selectSidebarFontStyle } from '../../features/ui/uiSlice';
import { getAccentTheme, accentCssBackground } from '../../theme/accentThemes';

export const SIDEBAR_WIDTH = 264;
export const SIDEBAR_RAIL_WIDTH = 70;

// Nav item sizing — tweak these to resize every menu row at once instead of
// hunting through the ListItemButton sx below.
const NAV_ITEM_HEIGHT = 0;
const NAV_ITEM_PADDING_TOP = 1;
const NAV_ITEM_PADDING_BOTTOM = 1;
const NAV_ITEM_GAP = 0;
const NAV_ITEM_RADIUS = 0;
const NAV_ITEM_PADDING_X = 16;
const NAV_ITEM_PADDING_X_COLLAPSED = 12;
const NAV_ICON_WIDTH = 40;
const NAV_ICON_FONT_SIZE = 20;
const NAV_LABEL_FONT_SIZE = 13;

function NavList({ collapsed, onNavigate, activeBackground, sidebarFont, sidebarFontStyle, isDark }) {
  // Translated on every render via the active i18next language (English,
  // Tamil or Hindi — see src/i18n) so the whole menu, including every
  // submenu section below, follows the Topbar language switcher.
  const navSections = useNavSections();
  const itemColor = isDark ? 'rgba(255,255,255,0.75)' : 'text.secondary';
  const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'divider';
  const scrollbarThumb = isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';
  const scrollbarThumbHover = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';

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
      }}
    >
      {navSections.map((section, sectionIndex) => (
        <Box key={section.key}>
          {sectionIndex > 0 && <Divider sx={{ borderColor: dividerColor, my: 1, mx: 2 }} />}
          <List disablePadding sx={{ px: 1.25 }}>
            {section.items.map((item) => {
              const Icon = item.icon;
              const button = (
                <ListItemButton
                  key={item.key}
                  component={NavLink}
                  to={item.path}
                  onClick={onNavigate}
                  sx={{
                    borderRadius: `${NAV_ITEM_RADIUS}px`,
                    mb: `${NAV_ITEM_GAP}px`,
                    minHeight: NAV_ITEM_HEIGHT,
                    pt: `${NAV_ITEM_PADDING_TOP}px`,
                    pb: `${NAV_ITEM_PADDING_BOTTOM}px`,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: `${collapsed ? NAV_ITEM_PADDING_X_COLLAPSED : NAV_ITEM_PADDING_X}px`,
                    color: itemColor,
                    '&.active': {
                      background: activeBackground,
                      color: '#fff',
                      '& .MuiListItemIcon-root': { color: '#fff' },
                    },
                    '&:hover': { bgcolor: hoverBg },
                    '&.active:hover': { background: activeBackground },
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
