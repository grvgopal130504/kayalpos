import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const COLUMNS = [
  { key: 'itemCode', label: 'Item Code' },
  { key: 'itemName', label: 'Item Name' },
  { key: 'number', label: 'Batch / Serial No.' },
  { key: 'type', label: 'Batch / Serial Type' },
  { key: 'mfgDate', label: 'Manufacturing Date' },
  { key: 'expiryDate', label: 'Expiry Date' },
  { key: 'warehouse', label: 'Warehouse / Outlet' },
  { key: 'qty', label: 'Available Qty' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' },
];

const TYPE_STYLES = {
  Batch: { bgcolor: 'rgba(34,160,107,0.12)', color: '#1B8354' },
  Serial: { bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB' },
};

/**
 * "Batch / Serial Number List" table — mirrors SupplierTable/ProductTable's
 * shape: a color-coded Batch/Serial Type chip (green Batch / blue Serial),
 * an "—" placeholder for serial-tracked rows with no expiry, a green Status
 * chip, and edit/delete row actions, neither wired to a real form yet.
 */
export default function BatchSerialTable({ rows, onOpenRow, onEditRow, onDeleteRow }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 1300 }}>
        <TableHead>
          <TableRow>
            {COLUMNS.map((col) => (
              <TableCell key={col.key} sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 12.5, whiteSpace: 'nowrap' }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => {
            const typeStyle = TYPE_STYLES[row.type] || { bgcolor: '#F1F2F4', color: '#5B6472' };
            return (
              <TableRow key={`${row.number}-${index}`} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Typography
                    component="button"
                    type="button"
                    onClick={() => onOpenRow?.(row)}
                    sx={{
                      font: 'inherit', fontWeight: 700, color: 'primary.main', bgcolor: 'transparent',
                      border: 0, p: 0, cursor: 'pointer', '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {row.itemCode}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.itemName}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{row.number}</TableCell>
                <TableCell>
                  <Chip label={row.type} size="small" sx={{ ...typeStyle, fontWeight: 700, height: 22 }} />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.mfgDate}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.expiryDate || '—'}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.warehouse}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{`${row.qty.toFixed(2)} ${row.uom}`}</TableCell>
                <TableCell>
                  <Chip
                    label={row.status}
                    size="small"
                    sx={{
                      bgcolor: row.status === 'Active' ? 'rgba(34,160,107,0.12)' : 'rgba(229,72,77,0.12)',
                      color: row.status === 'Active' ? 'success.main' : 'error.main',
                      fontWeight: 700, height: 22,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" color="primary" onClick={() => onEditRow?.(row)} aria-label={`Edit ${row.number}`}>
                      <EditOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDeleteRow?.(row)} aria-label={`Delete ${row.number}`}>
                      <DeleteOutlineOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS.length}>
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                  No batch/serial records match your search.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
