import { Box, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const TILE_COLORS = [
  '#F26B21', '#E5484D', '#8B5CF6', '#0EA5A4', '#F5A623',
  '#2563EB', '#22A06B', '#DB2777', '#6366F1', '#0891B2',
];

/**
 * The Home page's "Quick Access" module-shortcut grid. Reads straight from
 * navConfig's QUICK_ACCESS_ITEMS so it can never list a module the sidebar
 * doesn't also have.
 */
export default function QuickAccessGrid({ items }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)',
          md: 'repeat(4, 1fr)',
          lg: 'repeat(5, 1fr)',
        },
        gap: 1.5,
      }}
    >
      {items.map((item, index) => {
        const Icon = item.icon;
        const color = TILE_COLORS[index % TILE_COLORS.length];
        return (
          <Paper
            key={item.key}
            component={RouterLink}
            to={item.path}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              textDecoration: 'none',
              color: 'text.primary',
              transition: 'transform 0.15s, box-shadow 0.15s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 2, borderColor: color },
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: `${color}1A`,
                color,
              }}
            >
              <Icon fontSize="small" />
            </Box>
            <Typography variant="caption" align="center" sx={{ fontWeight: 600 }}>
              {item.label}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}
