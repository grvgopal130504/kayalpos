import { Stack, Typography } from '@mui/material';

/**
 * Numbered section heading used throughout the Create Loyalty Program form
 * ("1. Program Information", "2. Earning Rules", …) — same treatment as
 * Create Promotion / Create Gift Voucher's section headings.
 */
export default function LoyaltyFormSection({ number, title, children }) {
  return (
    <Stack spacing={2}>
      <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: 14.5 }}>
        {number}. {title}
      </Typography>
      {children}
    </Stack>
  );
}
