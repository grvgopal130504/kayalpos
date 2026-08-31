import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Button,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddIcon from '@mui/icons-material/Add';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'designation', label: 'Designation' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone / Mobile' },
  { key: 'primary', label: 'Primary' },
  { key: 'action', label: 'Action' },
];

/**
 * "Contact Person" grid on the Company Details tab — a plain read-only
 * list (Name / Designation / Email / Phone / a Primary Yes/No chip / row
 * actions) with an "Add Contact Person" button below it. Row edit/delete
 * and the add button aren't wired to a real form yet, so each just
 * surfaces a toast via the handlers passed in.
 */
export default function ContactPersonTable({ rows, onAdd, onEditRow, onDeleteRow }) {
  return (
    <Stack spacing={1.5}>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 720 }}>
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
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.name}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.designation}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.email}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.phone}</TableCell>
                <TableCell>
                  <Chip
                    label={row.primary ? 'Yes' : 'No'}
                    size="small"
                    sx={{
                      bgcolor: row.primary ? 'rgba(34,160,107,0.12)' : 'rgba(107,114,128,0.12)',
                      color: row.primary ? 'success.main' : 'text.secondary',
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
          </TableBody>
        </Table>
      </Box>

      <Button variant="text" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={onAdd} sx={{ alignSelf: 'flex-start', fontWeight: 700 }}>
        Add Contact Person
      </Button>
    </Stack>
  );
}
