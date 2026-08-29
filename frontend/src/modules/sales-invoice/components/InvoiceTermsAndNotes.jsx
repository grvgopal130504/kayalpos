import { Paper, Stack, Typography, TextField, Grid } from '@mui/material';

const DEFAULT_TERMS = [
  'This invoice is valid till the date mentioned above.',
  'Prices are subject to change without prior notice.',
  'Goods once sold will not be taken back.',
  'Payment to be made as per the agreed terms.',
];

/**
 * Full-width "Terms & Conditions" / "Notes" pair shown below the invoice
 * list + details panels, mirroring QuotationTermsAndNotes/
 * OrderTermsAndNotes exactly. The Create screen builds its own 3-column
 * variant (Terms + Notes + Summary side by side) directly in
 * CreateSalesInvoicePage to match the reference layout there.
 */
export default function InvoiceTermsAndNotes({ terms = DEFAULT_TERMS, notes, onNotesChange }) {
  return (
    <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Terms &amp; Conditions</Typography>
          <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
            {terms.map((term) => (
              <Typography key={term} component="li" variant="body2" sx={{ color: 'text.secondary' }}>
                {term}
              </Typography>
            ))}
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>Notes</Typography>
          <TextField
            fullWidth
            multiline
            minRows={4}
            placeholder="Enter notes (optional)"
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}

export { DEFAULT_TERMS };
