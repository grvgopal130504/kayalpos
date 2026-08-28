import { Stack, Button, FormControlLabel, Checkbox, Typography, IconButton } from '@mui/material';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

/**
 * Right-most column of the bottom row: the final "settle the sale" actions.
 * Kept as its own component (rather than folded into PaymentMethodsCard) so
 * it can sit in its own Grid slot, matching the reference's 3-column split.
 */
export default function PaymentActionsCard({
  onPayAndPrint, onPrintInvoice, onEmailOrWhatsapp,
  printSettingsEnabled, onTogglePrintSettings, disabled,
}) {
  return (
    <Stack spacing={1.5} sx={{ height: '100%', justifyContent: 'flex-start' }}>
      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={disabled}
        startIcon={<LocalPrintshopOutlinedIcon />}
        onClick={onPayAndPrint}
        sx={{ py: 1.5, fontSize: 15 }}
      >
        Pay &amp; Print (F9)
      </Button>

      <Button
        variant="outlined"
        size="large"
        fullWidth
        startIcon={<PrintOutlinedIcon />}
        onClick={onPrintInvoice}
      >
        Print Invoice (F10)
      </Button>

      <Button
        variant="outlined"
        size="large"
        fullWidth
        color="success"
        startIcon={<WhatsAppIcon />}
        onClick={onEmailOrWhatsapp}
      >
        Email / WhatsApp
      </Button>

      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', pt: 0.5 }}>
        <FormControlLabel
          sx={{ flex: 1, minWidth: 0, mr: 0 }}
          control={
            <Checkbox
              size="small"
              checked={printSettingsEnabled}
              onChange={(e) => onTogglePrintSettings(e.target.checked)}
            />
          }
          label={<Typography variant="body2">Print settings</Typography>}
        />
        <IconButton size="small">
          <SettingsOutlinedIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Stack>
  );
}
