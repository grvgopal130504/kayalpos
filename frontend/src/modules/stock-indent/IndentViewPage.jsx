import { useState } from 'react';
import {
  Stack, Box, Typography, Button, Grid, Breadcrumbs, Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';

import IndentDetailsCard from './components/IndentDetailsCard';
import IndentTermsAndNotes from './components/IndentTermsAndNotes';
import { getIndentDetails } from './stockIndentMockData';

/**
 * Read-only "View Indent" destination for StockIndentTable's row menu —
 * reuses the exact same IndentDetailsCard/IndentTermsAndNotes cards the
 * Overview/Status pages already show for the selected row, just addressed
 * by :code as its own full page instead of a side panel.
 */
export default function IndentViewPage() {
  const navigate = useNavigate();
  const { code } = useParams();
  const indent = getIndentDetails(code);
  const [notes, setNotes] = useState('');

  const handleBack = () => navigate('/stock-indent');
  const handleEdit = () => navigate(`/stock-indent/edit/${code}`);

  if (!indent) {
    return (
      <Stack spacing={2}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>Indent not found</Typography>
        <Button variant="outlined" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack} sx={{ width: 'fit-content' }}>
          Back to Stock Indent List
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{indent.code}</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/stock-indent" underline="hover" color="text.secondary">Stock Indent</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{indent.code}</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackOutlinedIcon fontSize="small" />} onClick={handleBack}>
            Back to Stock Indent List
          </Button>
          <Button variant="contained" onClick={handleEdit}>
            Edit Indent
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ alignItems: 'stretch' }}>
        <Grid size={12}>
          <IndentDetailsCard indent={indent} showApprovedFields={indent.status === 'approved'} />
        </Grid>
      </Grid>

      <IndentTermsAndNotes notes={notes} onNotesChange={setNotes} />
    </Stack>
  );
}
