import { NavLink } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, Tooltip } from '@mui/material';
import { NAV_SECTIONS } from './navConfig';
import AppLogo from '../common/AppLogo';

export const SIDEBAR_WIDTH = 264;
export const SIDEBAR_RAIL_WIDTH = 76;

function NavList({ collapsed, onNavigate }) {
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
        scrollbarColor: 'rgba(255,255,255,0.25) transparent',
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-button': { display: 'none', height: 0, width: 0 },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(255,255,255,0.25)',
          borderRadius: 4,
        },
        '&::-webkit-scrollbar-thumb:hover': { backgroundColor: 'rgba(255,255,255,0.4)' },
      }}
    >
      {NAV_SECTIONS.map((section, sectionIndex) => (
        <Box key={section.key}>
          {sectionIndex > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 1, mx: 2 }} />}
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
                    borderRadius: 2,
                    mb: 0.5,
                    minHeight: 44,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    px: collapsed ? 1.5 : 2,
                    color: 'rgba(255,255,255,0.75)',
                    '&.active': {
                      bgcolor: 'primary.main',
                      color: '#fff',
                      '& .MuiListItemIcon-root': { color: '#fff' },
                    },
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 40,
                      color: 'inherit',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      slotProps={{ primary: { fontSize: 14, fontWeight: 500, noWrap: true } }}
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

  const content = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'secondary.main',
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
          titleColor="#fff"
          subtitleColor="rgba(255,255,255,0.65)"
        />
      </Box>
      <NavList collapsed={collapsed} onNavigate={onNavigate} />
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
        transition: (theme) => theme.transitions.create('width'),
        '& .MuiDrawer-paper': {
          width,
          boxSizing: 'border-box',
          border: 'none',
          transition: (theme) => theme.transitions.create('width'),
          overflowX: 'hidden',
        },
      }}
    >
      {content}
    </Drawer>
  );
}
