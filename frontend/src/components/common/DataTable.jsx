import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box } from '@mui/material';

/**
 * Generic table used for every list screen and every dashboard table
 * (Recent Transactions, Low Stock Items, Top Selling Items, Outlet
 * Performance, and later full module list pages). Configure via `columns`:
 * [{ key, label, align, render(row, index) }]. Horizontal scroll on narrow
 * screens instead of a bespoke mobile layout, per the responsive rules.
 */
export default function DataTable({ columns, rows, getRowKey, emptyMessage = 'No records found', dense = false }) {
  if (!rows || rows.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: dense ? 0 : 480 }}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.key}
                align={col.align || 'left'}
                sx={{ color: 'text.secondary', fontWeight: 600, fontSize: 12.5, borderBottomColor: 'divider', whiteSpace: 'nowrap' }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow key={getRowKey ? getRowKey(row) : rowIndex} hover>
              {columns.map((col) => (
                <TableCell key={col.key} align={col.align || 'left'} sx={{ fontSize: 13.5, borderBottomColor: 'divider' }}>
                  {col.render ? col.render(row, rowIndex) : row[col.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
