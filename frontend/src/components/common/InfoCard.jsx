import { Paper, Box, Typography, Stack, Link as MuiLink } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/**
 * Generic "card with a title bar" shell used for every panel on the
 * dashboards (Sales Overview, Recent Transactions, Low Stock Items,
 * Expense Summary, etc.) so panels only differ in their body content, not
 * in how the title/action row or padding is built.
 *
 * `action` (optional): a small control rendered top-right (e.g. a period
 * select). `link` (optional): { label, to } rendered bottom-right of body.
 */
export default function InfoCard({ title, subtitle, action, link, children, sx, dense = false }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', ...sx }}>
      {(title || action) && (
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', px: dense ? 2 : 2.5, pt: dense ? 1.5 : 2.25, pb: 1 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
      )}
      <Box sx={{ px: dense ? 2 : 2.5, pb: dense ? 1.5 : 2.25, flex: 1, minWidth: 0 }}>{children}</Box>
      {link && (
        <Box sx={{ px: dense ? 2 : 2.5, pb: 2 }}>
          <MuiLink component={RouterLink} to={link.to} variant="body2" sx={{ fontWeight: 700 }} underline="hover">
            {link.label}
          </MuiLink>
        </Box>
      )}
    </Paper>
  );
}
