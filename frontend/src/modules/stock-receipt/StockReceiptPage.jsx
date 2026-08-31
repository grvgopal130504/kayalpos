import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';

import StockReceiptSummaryCards from './components/StockReceiptSummaryCards';
import StockReceiptTable from './components/StockReceiptTable';
import StockReceiptDetailsCard from './components/StockReceiptDetailsCard';
import { SUMMARY, RECEIPTS, TOTAL_RECEIPT_COUNT, RECEIPT_DETAILS } from './stockReceiptMockData';

const RECEIPT_BY_CODE = Object.fromEntries(RECEIPTS.map((r) => [r.code, r]));

/**
 * Landing page for the sidebar's Stock Receipt item — summary tiles, the
 * receipt list with a detail panel for whichever row is selected. "Create
 * Receipt" navigates to its own dedicated page. The Stock Receipt backend
 * module doesn't exist yet, so everything is driven by
 * stockReceiptMockData.js — selecting a row other than RCPT-00030 falls
 * back to reusing RECEIPT_DETAILS' shape (only the top-level fields differ)
 * since we don't have full mock detail records for every row.
 */
export default function StockReceiptPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [selectedCode, setSelectedCode] = useState(RECEIPT_DETAILS.code);

  const selectedRow = RECEIPT_BY_CODE[selectedCode];
  const receiptDetails = selectedCode === RECEIPT_DETAILS.code
    ? RECEIPT_DETAILS
    : {
        ...RECEIPT_DETAILS,
        code: selectedRow.code,
        date: selectedRow.date,
        supplier: selectedRow.supplier,
        purchaseType: selectedRow.purchaseType,
        invoiceNo: selectedRow.invoiceNo,
        items: selectedRow.items,
        totalValue: selectedRow.totalValue,
        status: selectedRow.status,
      };

  const handleSelectReceipt = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  const handleImport = () => dispatch(showToast('Import Receipts is coming soon', 'info'));
  const handleCreate = () => navigate('/stock-receipt/create');
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleEdit = () => dispatch(showToast('Edit Stock Receipt is coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Receipt</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Stock Receipt</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<FileUploadOutlinedIcon fontSize="small" />} onClick={handleImport}>
            Import Receipts
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            Create Receipt
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            endIcon={<ExpandMoreIcon />}
            onClick={(e) => setMoreActionsAnchor(e.currentTarget)}
          >
            More Actions
          </Button>
          <Menu anchorEl={moreActionsAnchor} open={Boolean(moreActionsAnchor)} onClose={() => setMoreActionsAnchor(null)}>
            <MenuItem onClick={() => handleMoreAction('Export Receipts')}>Export Receipts</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Print Receipts')}>Print Receipts</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Receipt Settings')}>Receipt Settings</MenuItem>
          </Menu>
        </Stack>
      </Stack>

      <StockReceiptSummaryCards summary={SUMMARY} />

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <StockReceiptTable
              receipts={RECEIPTS}
              totalCount={TOTAL_RECEIPT_COUNT}
              selectedCode={selectedCode}
              onSelectReceipt={handleSelectReceipt}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <StockReceiptDetailsCard receipt={receiptDetails} onEdit={handleEdit} />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  );
}
