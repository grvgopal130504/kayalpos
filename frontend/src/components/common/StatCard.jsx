import { Paper, Box, Typography, Stack, Link as MuiLink } from '@mui/material';
import { alpha } from '@mui/material/styles';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Link as RouterLink } from 'react-router-dom';

/**
 * KPI tile used across every dashboard (Home, Management Dashboard, and any
 * future summary page). One component, configured via props, instead of a
 * bespoke card per metric.
 *
 * `delta` (optional): { value: '12.5%', direction: 'up' | 'down', label: 'vs Yesterday' }
 * `caption` (optional): plain gray helper text shown instead of a delta
 * (e.g. "Total Active Items") when there's no up/down comparison to show.
 * `link` (optional): { label: 'View Details', to: '/some/route' }
 * `iconShape` (optional): 'square' (default, solid color + white icon) or
 * 'circle' (soft pastel bg + colored icon, used by the Promotion summary
 * tiles).
 * `iconColor` accepts either a theme palette key ('primary', 'success', …)
 * or a literal hex color (e.g. '#8B5CF6') for one-off tile colors that
 * aren't in the palette.
 */
export default function StatCard({
  icon: Icon, iconColor = 'primary', label, value, delta, caption, link, valueColor, iconShape = 'square',
}) {
  const isHex = iconColor.startsWith('#');
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.25,
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        {Icon && (
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: iconShape === 'circle' ? '50%' : 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: iconShape === 'circle'
                ? (theme) => alpha(isHex ? iconColor : theme.palette[iconColor].main, 0.12)
                : (isHex ? iconColor : `${iconColor}.main`),
              color: iconShape === 'circle' ? (isHex ? iconColor : `${iconColor}.main`) : '#fff',
              opacity: iconShape === 'circle' ? 1 : 0.95,
              flexShrink: 0,
            }}
          >
            <Icon fontSize="small" />
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              lineHeight: 1.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              color: valueColor || 'text.primary',
              mt: 0.25,
              fontSize: 'clamp(0.95rem, 1.3vw, 1.25rem)',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {value}
          </Typography>
        </Box>
      </Stack>

      {delta && (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
          {delta.direction === 'up' ? (
            <ArrowUpwardIcon sx={{ fontSize: 14, color: 'success.main', flexShrink: 0 }} />
          ) : (
            <ArrowDownwardIcon sx={{ fontSize: 14, color: 'error.main', flexShrink: 0 }} />
          )}
          <Typography variant="caption" sx={{ color: delta.direction === 'up' ? 'success.main' : 'error.main', fontWeight: 700, flexShrink: 0 }}>
            {delta.value}
          </Typography>
          {delta.label && (
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {delta.label}
            </Typography>
          )}
        </Stack>
      )}

      {caption && !delta && (
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {caption}
        </Typography>
      )}

      {link && (
        <MuiLink component={RouterLink} to={link.to} variant="caption" sx={{ fontWeight: 700 }} underline="hover">
          {link.label}
        </MuiLink>
      )}
    </Paper>
  );
}
