import { Stack, Typography } from '@mui/material';

/**
 * Numbered section heading used throughout the Create Promotion form
 * ("1. Promotion Information", "2. Applies To", …) so every section shares
 * the same orange, bold, small-caps-ish treatment.
 */
export default function PromotionFormSection({ number, title, children }) {
  return (
    <Stack spacing={2}>
      <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: 14.5 }}>
        {number}. {title}
      </Typography>
      {children}
    </Stack>
  );
}
