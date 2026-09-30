import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const COLUMNS = [
  { key: 'code', label: 'Tax Code' },
  { key: 'name', label: 'Tax Name' },
  { key: 'type', label: 'Tax Type' },
  { key: 'category', label: 'Tax Category' },
  { key: 'rate', label: 'Rate (%)' },
  { key: 'calculationType', label: 'Calculation Type' },
  { key: 'appliesTo', label: 'Applies To' },
  { key: 'status', label: 'Status' },
  { key: 'effectiveFrom', label: 'Effective From' },
  { key: 'action', label: 'Action' },
];

/**
 * "Tax Code List" table — plain rows with a green/red Status chip and
 * edit/delete row actions, neither wired to a real form yet.
 */
export default function TaxCodeTable({ rows, onViewRow, onEditRow, onDeleteRow }) {
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
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.code}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.name}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.type}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.category}</TableCell>
              <TableCell>{typeof row.rate === 'number' ? row.rate.toFixed(2) : row.rate}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.calculationType}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.appliesTo}</TableCell>
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
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.effectiveFrom}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => onViewRow?.(row)} aria-label={`View ${row.name}`}>
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
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
                  No tax codes match your search.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
