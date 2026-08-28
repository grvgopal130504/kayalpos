import { Box, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Card grid used for a parent sidebar item's "landing" page — e.g. clicking
 * Promotion shows cards for Active/Upcoming/Expired/Create Promotion
 * instead of going straight to one sub-screen. Left-aligned icon-over-label
 * cards, 4 columns down to 1 on phones. Reuse this for any future
 * parent-with-sub-modules page instead of redrawing the grid per module.
 *
 * `items`: [{ key, label, icon, to }] — `to` navigates via react-router;
 * omit it and pass `onClick` instead for a card that isn't a real route yet
 * (e.g. still "coming soon").
 */
export default function ModuleCardGrid({ items }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 2,
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const linkProps = item.to ? { component: RouterLink, to: item.to } : { component: 'button', type: 'button' };
        return (
          <Paper
            key={item.key}
            variant="outlined"
            onClick={item.onClick}
            {...linkProps}
            sx={{
              p: 2.5,
              borderRadius: 3,
              textAlign: 'left',
              textDecoration: 'none',
              color: 'text.primary',
              cursor: 'pointer',
              display: 'block',
              width: '100%',
              font: 'inherit',
              transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 2, borderColor: 'primary.main' },
            }}
          >
            <Icon sx={{ fontSize: 28, color: '#2563EB', display: 'block', mb: 1.5 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {item.label}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}
