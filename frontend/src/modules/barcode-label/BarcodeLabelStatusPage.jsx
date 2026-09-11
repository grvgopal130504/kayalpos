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
import CardGiftcardOutlinedIcon from '@mui/icons-material/CardGiftcardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocalPrintshopOutlinedIcon from '@mui/icons-material/LocalPrintshopOutlined';
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';

import { useAppDispatch } from '../../app/hooks';
import { showToast } from '../../features/ui/uiSlice';
import StatCard from '../../components/common/StatCard';
import { formatNumber } from '../../utils/format';

import BarcodeLabelTable from './components/BarcodeLabelTable';
import LabelDetailsCard from './components/LabelDetailsCard';
import LabelTermsAndNotes from './components/LabelTermsAndNotes';
import { BATCHES, STATUS_DETAILS, STATUS_STATS } from './barcodeLabelMockData';

const BATCH_BY_CODE = Object.fromEntries(BATCHES.map((b) => [b.code, b]));

const STATUS_META = {
  draft: { label: 'Draft Batches', pageTitle: 'Draft', icon: EditNoteOutlinedIcon, iconColor: 'warning' },
  'pending-print': { label: 'Pending Print Batches', pageTitle: 'Pending Print', icon: HourglassEmptyOutlinedIcon, iconColor: 'error' },
  printed: { label: 'Printed Batches', pageTitle: 'Printed', icon: CheckCircleOutlinedIcon, iconColor: 'success' },
};

// The 3 "extra" stat tile icons/colors per status, in the same order as
// each status's STATUS_STATS.extra array.
const EXTRA_TILE_STYLE = {
  draft: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: HourglassEmptyOutlinedIcon, iconColor: 'warning' },
    { icon: DescriptionOutlinedIcon, iconColor: '#8B5CF6' },
  ],
  'pending-print': [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: LocalPrintshopOutlinedIcon, iconColor: 'warning' },
    { icon: AutorenewOutlinedIcon, iconColor: '#8B5CF6' },
  ],
  printed: [
    { icon: CardGiftcardOutlinedIcon, iconColor: 'success' },
    { icon: LocalPrintshopOutlinedIcon, iconColor: 'warning' },
    { icon: AutorenewOutlinedIcon, iconColor: '#8B5CF6' },
  ],
};

/**
 * Shared page for the Draft / Pending Print / Printed cards on the
 * Barcode & Label landing grid — same list+details+terms layout as the
 * "All Batches" overview page, scoped by `status`. Mirrors
 * SalesInvoiceStatusPage/SalesOrderStatusPage.
 */
export default function BarcodeLabelStatusPage({ status, tab, onTabChange, onCreate, onView, onEdit }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const meta = STATUS_META[status];
  const stats = STATUS_STATS[status];
  const detailsTemplate = STATUS_DETAILS[status];
  const extraStyle = EXTRA_TILE_STYLE[status];
  const [moreActionsAnchor, setMoreActionsAnchor] = useState(null);
  const [notes, setNotes] = useState('');

  const firstOfStatus = BATCHES.find((b) => b.status === status) || BATCHES[0];
  const [selectedCode, setSelectedCode] = useState(firstOfStatus.code);
  const selectedRow = BATCH_BY_CODE[selectedCode] || firstOfStatus;
  const batchDetails = selectedCode === detailsTemplate.code
    ? detailsTemplate
    : {
        ...detailsTemplate,
        code: selectedRow.code,
        date: selectedRow.date,
        labelName: selectedRow.labelName,
        itemCategory: selectedRow.itemCategory,
        totalLabels: selectedRow.totalLabels,
        ...(selectedRow.status === 'printed' ? { printedOn: selectedRow.date } : {}),
      };

  const handleSelectBatch = (row) => setSelectedCode(row.code);
  const handleRowAction = (label, row) => {
    if (label === 'View') return onView ? onView(row.code) : navigate(`/barcode-label/view/${row.code}`);
    if (label === 'Edit') return onEdit ? onEdit(row.code) : navigate(`/barcode-label/edit/${row.code}`);
    return dispatch(showToast(`${label} "${row.code}" is coming soon`, 'info'));
  };
  const handlePrintPreview = () => dispatch(showToast('Print / Preview is coming soon', 'info'));
  const handleCreate = () => {
    if (onCreate) onCreate(); else navigate('/barcode-label/create');
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
      value: formatNumber(tile.value),
      caption: tile.caption,
    })),
  ];

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', lg: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Barcode &amp; Label ({meta.pageTitle})</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/barcode-label" underline="hover" color="text.secondary">Barcode &amp; Label</MuiLink>
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
            <MenuItem onClick={() => handleMoreAction('Export Batches')}>Export Batches</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Duplicate Batch')}>Duplicate Batch</MenuItem>
            <MenuItem onClick={() => handleMoreAction('Delete Batch')}>Delete Batch</MenuItem>
          </Menu>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
            New Barcode &amp; Label
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
            <BarcodeLabelTable
              batches={BATCHES}
              selectedCode={selectedCode}
              onSelectBatch={handleSelectBatch}
              onRowAction={handleRowAction}
              onFilters={handleFilters}
              defaultTab={status}
              tab={tab}
              onTabChange={onTabChange}
              statusColumn={false}
              createdByColumn={status !== 'printed'}
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Box sx={{ height: { lg: 560 }, overflow: 'auto' }}>
            <LabelDetailsCard batch={batchDetails} title={`Batch Details (${meta.pageTitle})`} showPrintedFields={status === 'printed'} />
          </Box>
        </Grid>
      </Grid>

      <LabelTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
