import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Typography,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const COLUMNS = [
  { key: 'code', label: 'HSN / SAC Code' },
  { key: 'description', label: 'Description' },
  { key: 'type', label: 'Type' },
  { key: 'chapter', label: 'Chapter' },
  { key: 'taxRate', label: 'Tax Rate (%)' },
  { key: 'uqc', label: 'UQC' },
  { key: 'status', label: 'Status' },
  { key: 'effectiveFrom', label: 'Effective From' },
  { key: 'action', label: 'Action' },
];

/**
 * "HSN / SAC List" table — plain rows with a green/grey Status chip and
 * edit/delete row actions, neither wired to a real form yet.
 */
export default function HsnSacTable({ rows, onViewRow, onEditRow, onDeleteRow }) {
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
          {rows.map((row) => (
            <TableRow key={row.code} hover>
              <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.code}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.description}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.type}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.chapter}</TableCell>
              <TableCell>{row.taxRate.toFixed(2)}</TableCell>
              <TableCell>{row.uqc}</TableCell>
              <TableCell>
                <Chip
                  label={row.status}
                  size="small"
                  sx={{
                    bgcolor: row.status === 'Active' ? 'rgba(34,160,107,0.12)' : 'rgba(107,114,128,0.12)',
                    color: row.status === 'Active' ? 'success.main' : 'text.secondary',
                    fontWeight: 700, height: 22,
                  }}
                />
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.effectiveFrom}</TableCell>
              <TableCell>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => onViewRow?.(row)} aria-label={`View ${row.code}`}>
                    <VisibilityOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="primary" onClick={() => onEditRow?.(row)} aria-label={`Edit ${row.code}`}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => onDeleteRow?.(row)} aria-label={`Delete ${row.code}`}>
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
                  No HSN / SAC codes match your search.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
