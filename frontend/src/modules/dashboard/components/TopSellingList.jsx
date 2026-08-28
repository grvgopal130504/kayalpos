import { Stack, Box, Typography } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { formatNumber } from '../../../utils/format';

/**
 * Icon + name + quantity ranked list used on the Home dashboard's "Top
 * Selling Items" card. The Management Dashboard shows the same underlying
 * data as a full DataTable instead — both read from the same API field.
 */
export default function TopSellingList({ items }) {
  return (
    <Stack spacing={1.75}>
      {items.map((item) => (
        <Stack key={item.id} direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.5,
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Inventory2OutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          </Box>
          <Typography variant="body2" sx={{ flex: 1, minWidth: 0, fontWeight: 500 }} noWrap>
            {item.name}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
            {formatNumber(item.qty)}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
