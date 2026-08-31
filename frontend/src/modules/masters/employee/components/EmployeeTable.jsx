import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Typography, Avatar,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const COLUMNS = [
  { key: 'code', label: 'Employee Code' },
  { key: 'name', label: 'Employee Name' },
  { key: 'type', label: 'Employee Type' },
  { key: 'location', label: 'Location' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'loginUser', label: 'Login User' },
  { key: 'status', label: 'Status' },
  { key: 'joiningDate', label: 'Joining Date' },
  { key: 'action', label: 'Action' },
];

// Soft, deterministic avatar colors keyed off the employee's initials so the
// same person always gets the same color without needing a real photo.
const AVATAR_PALETTE = ['#2563EB', '#7C3AED', '#0EA5A4', '#F26B21', '#E5484D', '#22A06B'];

function initialsOf(name) {
  const parts = String(name).trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase();
}

function avatarColorFor(name) {
  const sum = String(name).split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return AVATAR_PALETTE[sum % AVATAR_PALETTE.length];
}

const TYPE_STYLES = {
  Cashier: { bgcolor: 'rgba(34,160,107,0.12)', color: '#1B8354' },
  'Sales Employee': { bgcolor: 'rgba(37,99,235,0.12)', color: '#2563EB' },
};

/**
 * "Employee List" table — mirrors SupplierTable/ProductTable's shape: an
 * avatar + name cell, color-coded Employee Type and Status chips, and
 * edit/delete row actions, neither wired to a real form yet.
 */
export default function EmployeeTable({ rows, onOpenEmployee, onEditRow, onDeleteRow }) {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table size="small" sx={{ minWidth: 1200 }}>
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
          {rows.map((row) => {
            const typeStyle = TYPE_STYLES[row.type] || { bgcolor: '#F1F2F4', color: '#5B6472' };
            return (
              <TableRow key={row.code} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Typography
                    component="button"
                    type="button"
                    onClick={() => onOpenEmployee?.(row)}
                    sx={{
                      font: 'inherit', fontWeight: 700, color: 'primary.main', bgcolor: 'transparent',
                      border: 0, p: 0, cursor: 'pointer', '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    {row.code}
                  </Typography>
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <Avatar sx={{ width: 30, height: 30, fontSize: 13, fontWeight: 700, bgcolor: avatarColorFor(row.name) }}>
                      {initialsOf(row.name)}
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip label={row.type} size="small" sx={{ ...typeStyle, fontWeight: 700, height: 22 }} />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.location}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.phone}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.email}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.loginUser}</TableCell>
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
                <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.joiningDate}</TableCell>
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
            );
          })}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={COLUMNS.length}>
                <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 3 }}>
                  No employees match your search.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
