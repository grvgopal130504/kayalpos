import { Paper, Stack, Button, FormControlLabel, Checkbox, Typography, IconButton } from '@mui/material';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

/**
 * Sits alongside OriginalInvoiceSummaryCard / RefundSummaryCard /
 * PaymentMethodSummaryCard in the same Grid row, so it needs the same
 * outlined-Paper card shell as those three — otherwise it has no border or
 * padding and visibly doesn't line up with its siblings.
 */
export default function ReturnActionsCard({
  onProcessReturn, onPrintReturn, onEmailOrWhatsapp,
  printSettingsEnabled, onTogglePrintSettings, disabled,
}) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: 2, height: '100%' }}>
      <Stack spacing={1.5} sx={{ height: '100%', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          fullWidth
          disabled={disabled}
          startIcon={<AutorenewOutlinedIcon />}
          onClick={onProcessReturn}
          sx={{ py: 1.5, fontSize: 15 }}
        >
          Process Return (F9)
        </Button>

        <Button
          variant="outlined"
          size="large"
          fullWidth
          startIcon={<PrintOutlinedIcon />}
          onClick={onPrintReturn}
        >
          Print Return (F10)
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
    </Paper>
  );
}
