import { Paper, Stack, Box, Typography } from '@mui/material';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

const ITEMS = [
  { icon: BadgeOutlinedIcon, title: 'Cashier Login', description: 'Enter your cashier code and password to access the POS system.' },
  { icon: QrCode2OutlinedIcon, title: 'Use PIN Login', description: 'For faster access, use your 4-digit PIN.' },
  { icon: LockOutlinedIcon, title: 'Secure Access', description: 'Do not share your login credentials with others.' },
  { icon: LogoutOutlinedIcon, title: 'Logout', description: 'Always logout after completing your session.' },
];

/**
 * "Instructions" panel on the Cashier Login screen — a short icon +
 * title + description list explaining the login options below,
 * matching the reference.
 */
export default function CashierLoginInstructions() {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Instructions</Typography>
      <Stack spacing={2.5}>
        {ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Stack key={item.title} direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
              <Box
                sx={{
                  width: 40, height: 40, borderRadius: 2, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  bgcolor: 'rgba(37,99,235,0.1)', color: '#2563EB',
                }}
              >
                <Icon fontSize="small" />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{item.title}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>{item.description}</Typography>
              </Box>
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
