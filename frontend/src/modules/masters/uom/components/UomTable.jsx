import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, Chip, IconButton, Stack, Typography,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const COLUMNS = [
  { key: 'code', label: 'UOM Code' },
  { key: 'name', label: 'UOM Name' },
  { key: 'group', label: 'UOM Group' },
  { key: 'baseUom', label: 'Base UOM' },
  { key: 'conversionFactor', label: 'Conversion Factor' },
  { key: 'status', label: 'Status' },
  { key: 'action', label: 'Action' },
];

/**
 * "UOM List" table — the right panel on the UOM / UOM Group page. Plain
 * rows with a green/grey Status chip and edit/delete row actions, neither
 * wired to a real form yet.
 */
export default function UomTable({ rows, onEditRow, onDeleteRow }) {
  return (
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
            <TableRow key={row.code} hover>
              <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.code}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.name}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.group}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.baseUom}</TableCell>
              <TableCell>{row.conversionFactor}</TableCell>
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
                  No UOMs match your search.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
}
