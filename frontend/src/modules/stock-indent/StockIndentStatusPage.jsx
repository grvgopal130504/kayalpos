import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Menu, MenuItem, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddIcon from '@mui/icons-material/Add';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import { formatCurrency, formatNumber } from '../../utils/format';

import StockIndentTable from './components/StockIndentTable';
import IndentDetailsCard from './components/IndentDetailsCard';
import IndentTermsAndNotes from './components/IndentTermsAndNotes';
import { INDENTS, STATUS_DETAILS, STATUS_STATS } from './stockIndentMockData';

const INDENT_BY_CODE = Object.fromEntries(INDENTS.map((ind) => [ind.code, ind]));

const STATUS_META = {
  draft: { label: 'Draft Indents', pageTitle: 'Draft', icon: EditNoteOutlinedIcon, iconColor: 'warning' },
  'pending-approval': { label: 'Pending Approval Indents', pageTitle: 'Pending Approval', icon: HourglassEmptyOutlinedIcon, iconColor: 'info' },
  approved: { label: 'Approved Indents', pageTitle: 'Approved', icon: CheckCircleOutlinedIcon, iconColor: 'success' },
  rejected: { label: 'Rejected Indents', pageTitle: 'Rejected', icon: CancelOutlinedIcon, iconColor: 'error' },
};

// The 3 "extra" stat tile icons/colors per status, in the same order as
// each status's STATUS_STATS.extra array.
const EXTRA_TILE_STYLE = {
  draft: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: HourglassEmptyOutlinedIcon, iconColor: 'warning' },
    { icon: DescriptionOutlinedIcon, iconColor: '#8B5CF6' },
  ],
  'pending-approval': [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: HourglassEmptyOutlinedIcon, iconColor: 'warning' },
    { icon: AutorenewOutlinedIcon, iconColor: '#8B5CF6' },
  ],
  approved: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: CheckCircleOutlinedIcon, iconColor: 'warning' },
    { icon: AutorenewOutlinedIcon, iconColor: '#8B5CF6' },
  ],
  rejected: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'error' },
    { icon: CancelOutlinedIcon, iconColor: 'warning' },
    { icon: AutorenewOutlinedIcon, iconColor: '#8B5CF6' },
  ],
};

/**
 * Shared page for the Draft / Pending Approval / Approved / Rejected
 * cards on the Stock Indent landing grid — same list+details+terms layout
 * as the "All Indents" overview page, scoped by `status`. Mirrors
 * SalesInvoiceStatusPage/BarcodeLabelStatusPage.
 */
export default function StockIndentStatusPage({ status, tab, onTabChange, onCreate }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const meta = STATUS_META[status];
  const stats = STATUS_STATS[status];
  const detailsTemplate = STATUS_DETAILS[status];
  const extraStyle = EXTRA_TILE_STYLE[status];
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [notes, setNotes] = useState('');

  const firstOfStatus = INDENTS.find((ind) => ind.status === status) || INDENTS[0];
  const [selectedCode, setSelectedCode] = useState(firstOfStatus.code);
  const selectedRow = INDENT_BY_CODE[selectedCode] || firstOfStatus;
  const indentDetails = selectedCode === detailsTemplate.code
    ? detailsTemplate
    : {
        ...detailsTemplate,
        code: selectedRow.code,
        date: selectedRow.date,
        department: selectedRow.department,
        fromOutlet: selectedRow.fromOutlet,
        toOutlet: selectedRow.toOutlet,
        requiredDate: selectedRow.requiredDate,
        estimatedValue: selectedRow.estimatedValue,
        ...(selectedRow.status === 'approved' ? { approvedOn: selectedRow.date, approvedBy: 'Admin' } : {}),
      };

  const handleSelectIndent = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => {
    if (label === 'View') return navigate(`/stock-indent/view/${row.code}`);
    if (label === 'Edit') return navigate(`/stock-indent/edit/${row.code}`);
    dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleCreate = () => {
    if (onCreate) onCreate(); else navigate('/stock-indent/create');
  };
  const handleFilters = () => dispatch(showToast('Filters are coming soon', 'info'));
  const handleMoreAction = (label) => {
    setMoreActionsAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };

  const tiles = [
    { icon: meta.icon, iconColor: meta.iconColor, label: `Total ${meta.label}`, value: formatNumber(stats.count.value), caption: stats.count.caption },
    ...stats.extra.map((tile, i) => ({
      icon: extraStyle[i].icon,
      iconColor: extraStyle[i].iconColor,
      label: tile.label,
      value: tile.isText ? tile.value : (tile.currency ? formatCurrency(tile.value, { decimals: true }) : formatNumber(tile.value)),
      caption: tile.caption,
    })),
  ];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Stock Indent ({meta.pageTitle})</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-indent" underline="hover" color="text.secondary">Stock Indent</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{meta.pageTitle}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' } }}>
          <Button variant="outlined" color="inherit" startIcon={<PrintOutlinedIcon fontSize="small" />} onClick={handlePrintPreview}>
            Print / Preview
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
            <MenuItem onClick={() => handleMoreAction('Export Indents')}>Export Indents</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Duplicate Indent')}>Duplicate Indent</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Delete Indent')}>Delete Indent</MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New Stock Indent
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {tiles.map((tile) => (
          <Grid key={tile.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard icon={tile.icon} iconColor={tile.iconColor} iconShape="circle" label={tile.label} value={tile.value} caption={tile.caption} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Box sx={{ height: { lg: 560 } }}>
            <StockIndentTable
              indents={INDENTS}
              selectedCode={selectedCode}
              onSelectIndent={handleSelectIndent}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              defaultTab={status}
              tab={tab}
              onTabChange={onTabChange}
              statusColumn={false}
              createdByColumn={status !== 'approved'}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 }, overflow: 'auto' }}>
            <IndentDetailsCard indent={indentDetails} title={`Indent Details (${meta.pageTitle})`} showApprovedFields={status === 'approved'} />
          </Box>
        </Grid>
      </Grid>

      <IndentTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
