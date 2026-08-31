import React from 'react';
import { Box, Typography } from '@mui/material';

const LOGO_ICON_URL = 'https://i.ibb.co/v6qwV2tf/img-logo.png';

// Brand mark's "O" is fixed orange — it must not follow the accent theme
// picker (unlike primary.main elsewhere, which does).
const LOGO_O_COLOR = '#F26B21';

const SUBTITLE_TEXT = 'POINT OF SALE';
// Per-letter typing effect that loops forever: every letter shares one
// keyframe/duration (the full loop length) but each starts at a different
// delay, so they type in left-to-right, hold, then fade out in the same
// left-to-right order right before the next loop types them back in —
// without a clipped-width caret trick fighting the letter-spacing.
const SUBTITLE_LETTER_STAGGER_MS = 55;
const SUBTITLE_LOOP_MS = 4000;
const SUBTITLE_LETTER_KEYFRAMES = {
  '@keyframes nexoraLetterLoop': {
    '0%': { opacity: 0, transform: 'translateY(3px)' },
    '4%': { opacity: 1, transform: 'translateY(0)' },
    '82%': { opacity: 1, transform: 'translateY(0)' },
    '92%': { opacity: 0, transform: 'translateY(3px)' },
    '100%': { opacity: 0, transform: 'translateY(3px)' },
  },
};

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
            <Box component="span" sx={{ color: LOGO_O_COLOR }}>O</Box>
            RA
          </Typography>
          <Typography
            noWrap
            component="div"
            sx={{
              fontSize: subtitleFontSize, fontWeight: 600, letterSpacing: '0.22em',
              color: subtitleColor, lineHeight: 1.4,
              display: 'flex',
              ...SUBTITLE_LETTER_KEYFRAMES,
            }}
          >
            {SUBTITLE_TEXT.split('').map((char, i) => (
              <Box
                key={i}
                component="span"
                sx={{
                  display: 'inline-block',
                  whiteSpace: 'pre',
                  opacity: 0,
                  animation: `nexoraLetterLoop ${SUBTITLE_LOOP_MS}ms ease-in-out ${i * SUBTITLE_LETTER_STAGGER_MS}ms infinite`,
                }}
              >
                {char}
              </Box>
            ))}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
