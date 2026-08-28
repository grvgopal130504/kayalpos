import { Stack, Typography } from '@mui/material';

/**
 * Numbered section heading used throughout the Create Gift Voucher form
 * ("1. Voucher Information", "2. Validity", …) — same treatment as
 * Create Promotion's section headings.
 */
export default function VoucherFormSection({ number, title, children }) {
  return (
    <Stack spacing={2}>
      <Typography sx={{ fontWeight: 700, color: 'primary.main', fontSize: 14.5 }}>
        {number}. {title}
      </Typography>
      {children}
    </Stack>
  );
}
