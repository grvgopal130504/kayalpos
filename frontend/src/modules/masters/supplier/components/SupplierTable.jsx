import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Typography, Link as MuiLink,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const COLUMNS = [
  { key: 'code', label: 'Supplier Code' },
  { key: 'name', label: 'Supplier Name' },
  { key: 'group', label: 'Supplier Group' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'gstNo', label: 'GST No.' },
  { key: 'paymentTerms', label: 'Payment Terms' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' },
];

/**
 * "Supplier List" table — the Supplier Code is a link (matching the
 * reference's blue-code convention used elsewhere in this app), with a
 * green/grey Status chip and edit/delete row actions, neither wired to a
 * real form yet.
 */
export default function SupplierTable({ rows, onOpenSupplier, onEditRow, onDeleteRow }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 1400 }}>
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
          {rows.map((row) => (
            <TableRow key={row.code} hover>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>
                <MuiLink component="button" type="button" underline="hover" onClick={() => onOpenSupplier?.(row)} sx={{ fontWeight: 700 }}>
                  {row.code}
                </MuiLink>
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.name}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.group}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.phone}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.email}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.city}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.state}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.gstNo}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.paymentTerms}</TableCell>
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
                  <IconButton size="small" color="primary" onClick={() => onEditRow?.(row)} aria-label={`Edit ${row.name}`}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDeleteRow?.(row)} aria-label={`Delete ${row.name}`}>
                    <DeleteOutlineOutlinedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS.length}>
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                  No suppliers match your search.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
