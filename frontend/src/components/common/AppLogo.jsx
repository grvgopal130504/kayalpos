import React from 'react';
import { Box, Typography } from '@mui/material';

const LOGO_ICON_URL = 'https://i.ibb.co/v6qwV2tf/img-logo.png';

const BRAND_ACCENT = '#FF6B35';

/**
 * Nexora POS wordmark: raster brand icon (hosted) + "NEXORA / POINT OF SALE"
 * lockup. Single source of truth for the logo — used on the login page and
 * anywhere else the brand mark appears, instead of redrawing it per page.
 */
export default function AppLogo({
  iconOnly = false, iconSize = 36,
  titleFontSize = '1.05rem', subtitleFontSize = '0.6rem',
  // Overridable so the logo can sit on a dark background (e.g. the sidebar)
  // without losing the orange "O" accent — a blanket "force everything
  // white" override would wash that out too.
  titleColor = 'text.primary', subtitleColor = 'text.secondary',
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
      <Box
        component="img"
        src={LOGO_ICON_URL}
        alt="Nexora"
        sx={{ height: iconSize, width: 'auto', flexShrink: 0, objectFit: 'contain' }}
      />
      {!iconOnly && (
        <Box sx={{ minWidth: 0, lineHeight: 1 }}>
          <Typography
            noWrap
            sx={{
              fontWeight: 800, fontSize: titleFontSize, letterSpacing: '0.01em',
              color: titleColor, lineHeight: 1.15,
            }}
          >
            NEX
            <Box component="span" sx={{ color: BRAND_ACCENT }}>O</Box>
            RA
          </Typography>
          <Typography
            noWrap
            sx={{
              fontSize: subtitleFontSize, fontWeight: 600, letterSpacing: '0.22em',
              color: subtitleColor, lineHeight: 1.4,
            }}
          >
            POINT OF SALE
          </Typography>
        </Box>
      )}
    </Box>
  );
}
