import { Stack, Box, Typography, Button } from '@mui/material';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import InfoCard from '../../../components/common/InfoCard';

const ROWS = [
  { key: 'name', label: 'Name' },
  { key: 'phone', label: 'Phone' },
  { key: 'loyaltyPoints', label: 'Loyalty Points' },
];

export default function CustomerDetailsCard({ customer, onAddCustomer }) {
  return (
    <InfoCard title="Customer Details" dense sx={{ height: '100%' }}>
      <Stack spacing={1.25}>
        {ROWS.map((row) => (
          <Stack key={row.key} direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{row.label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{customer[row.key] ?? '-'}</Typography>
          </Stack>
        ))}
        <Box sx={{ pt: 0.5 }}>
          <Button
            variant="outlined"
            size="small"
            fullWidth
            startIcon={<PersonAddOutlinedIcon fontSize="small" />}
            onClick={onAddCustomer}
          >
            Add Customer
          </Button>
        </Box>
      </Stack>
    </InfoCard>
  );
}
