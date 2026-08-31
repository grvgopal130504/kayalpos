import { Paper, Stack, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

/**
 * "Quick Info" panel — a shield icon beside a short bulleted list of
 * operating reminders, matching the reference's icon-plus-list layout.
 */
export default function CashierQuickInfo({ items }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Quick Info</Typography>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <InfoOutlinedIcon sx={{ color: 'text.secondary', fontSize: 28, flexShrink: 0, mt: 0.25 }} />
        <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
          {items.map((item) => (
            <Typography key={item} component="li" variant="body2" sx={{ color: 'text.secondary' }}>
              {item}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
