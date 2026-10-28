import { alpha } from '@mui/material/styles';
import { Stack, Button, FormControlLabel, Checkbox, Typography, Paper, IconButton, Tooltip, Box } from '@mui/material';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailWhatsappButtons from '../../../components/common/EmailWhatsappButtons';

const keyHint = (label) => (
  <Box component="span" sx={{ ml: 1, px: 0.75, py: 0.1, borderRadius: 1, fontSize: 10.5, fontWeight: 700, bgcolor: 'rgba(255,255,255,0.22)' }}>{label}</Box>
);

/**
 * Right column of the payment step, under the amount-payable card: the final
 * "settle the sale" actions. The Email / WhatsApp buttons (shared component)
 * only render when enabled in Settings.
 */
export default function PaymentActionsCard({
  onPayAndPrint, onPrintInvoice, onBack,
  printSettingsEnabled, onTogglePrintSettings, disabled,
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 4, p: 2.5, boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)' }}>
      <Stack spacing={1.5}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={disabled}
          startIcon={<LocalPrintshopOutlinedIcon />}
          onClick={onPayAndPrint}
          sx={{
            py: 1.75, fontSize: 16, fontWeight: 800, borderRadius: 3,
            boxShadow: (t) => `0 8px 20px ${alpha(t.palette.primary.main, 0.35)}`,
            '&:hover': { boxShadow: (t) => `0 10px 24px ${alpha(t.palette.primary.main, 0.45)}` },
          }}
        >
          Pay &amp; Print{keyHint('F9')}
        </Button>

        <Button
          variant="outlined"
          size="large"
          fullWidth
          startIcon={<PrintOutlinedIcon />}
          onClick={onPrintInvoice}
          sx={{ py: 1.25, fontWeight: 700, borderRadius: 3 }}
        >
          Print Invoice
          <Box component="span" sx={{ ml: 1, px: 0.75, py: 0.1, borderRadius: 1, fontSize: 10.5, fontWeight: 700, bgcolor: 'action.selected' }}>F10</Box>
        </Button>

        <EmailWhatsappButtons />

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <FormControlLabel
            sx={{ mr: 0 }}
            control={(
              <Checkbox
                size="small"
                checked={printSettingsEnabled}
                onChange={(e) => onTogglePrintSettings(e.target.checked)}
              />
            )}
            label={<Typography variant="body2">Print settings</Typography>}
          />
          <Tooltip title="Print settings">
            <IconButton size="small" aria-label="Print settings"><SettingsOutlinedIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>

        <Button
          variant="text"
          size="small"
          startIcon={<ArrowBackIcon sx={{ fontSize: 14 }} />}
          onClick={onBack}
          sx={{ alignSelf: 'center', fontWeight: 700 }}
        >
          Back to cart
        </Button>
      </Stack>
    </Paper>
  );
}
