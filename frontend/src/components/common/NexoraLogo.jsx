import { Box, Typography, Stack } from '@mui/material';

/**
 * Reproduces the Nexora POS wordmark (orange ribbon mark + "NEXORA POINT OF
 * SALE" lockup) as an inline SVG + text, so it renders crisply at any size
 * without shipping a raster asset. Used wherever the brand mark appears
 * (login, sidebar header, etc.) — never re-drawn per page.
 */
export default function NexoraLogo({ size = 40, showSubtitle = true }) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
      <Box
        component="svg"
        viewBox="0 0 48 48"
        sx={{ width: size, height: size, flexShrink: 0 }}
        aria-hidden="true"
      >
        <path d="M6 8 L34 8 L18 22 L34 22 L6 40 L22 26 L6 26 Z" fill="#F26B21" />
        <path d="M14 8 L42 8 L26 22 L42 22 L14 40 L30 26 L14 26 Z" fill="#1F2A3C" opacity="0.15" />
      </Box>
      <Box>
        <Typography
          component="span"
          sx={{ fontWeight: 800, fontSize: size * 0.5, lineHeight: 1, letterSpacing: 0.5 }}
        >
          NEX<Box component="span" sx={{ color: 'primary.main' }}>ORA</Box>
        </Typography>
        {showSubtitle && (
          <Typography
            sx={{
              fontSize: size * 0.19,
              fontWeight: 600,
              letterSpacing: 2,
              color: 'text.secondary',
              lineHeight: 1,
              mt: 0.4,
            }}
          >
            POINT OF SALE
          </Typography>
        )}
      </Box>
    </Stack>
  );
}
