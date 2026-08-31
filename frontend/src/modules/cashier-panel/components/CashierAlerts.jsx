import { Paper, Stack, Typography } from '@mui/material';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const SEVERITY = {
  error: { icon: WarningAmberOutlinedIcon, color: 'error.main' },
  info: { icon: InfoOutlinedIcon, color: '#2563EB' },
};

/**
 * "Alerts" panel — a small red warning icon in the header plus a colored
 * icon + message per alert (error rows in red, informational rows in
 * blue), matching the reference.
 */
export default function CashierAlerts({ alerts }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mb: 1.5 }}>
        <WarningAmberOutlinedIcon sx={{ color: 'error.main', fontSize: 20 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Alerts</Typography>
      </Stack>
      <Stack spacing={1.25}>
        {alerts.map((alert) => {
          const { icon: Icon, color } = SEVERITY[alert.severity] || SEVERITY.info;
          return (
            <Stack key={alert.message} direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
              <Icon sx={{ color, fontSize: 18, flexShrink: 0, mt: 0.1 }} />
              <Typography variant="body2" sx={{ color, fontWeight: 600 }}>{alert.message}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
