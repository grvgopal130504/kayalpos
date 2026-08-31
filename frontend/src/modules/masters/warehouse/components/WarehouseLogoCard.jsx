import { Paper, Stack, Box, Typography, Button } from '@mui/material';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

/**
 * "Warehouse Logo" sidebar card — same pattern as the Company/Outlet
 * masters' logo cards (a colored initial badge standing in for the
 * actual uploaded image, since this warehouse inherits the parent
 * company's branding in this mock data), with local-only Upload / Remove
 * actions.
 */
export default function WarehouseLogoCard({ warehouseName, logoName, onUpload, onRemove }) {
  const initial = (warehouseName || 'W').trim().charAt(0).toUpperCase();

  return (
    <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Warehouse Logo</Typography>

      <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            width: 160,
            height: 160,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #C1121F 0%, #7A0C13 100%)',
            color: '#fff',
            fontSize: 56,
            fontWeight: 800,
            boxShadow: '0 4px 14px rgba(193,18,31,0.35)',
          }}
        >
          {initial}
        </Box>

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Recommended size 200 x 200 px
        </Typography>

        <Stack direction="row" spacing={1.25}>
          <Button variant="outlined" color="primary" size="small" component="label" startIcon={<FileUploadOutlinedIcon fontSize="small" />}>
            Upload
            <input type="file" hidden accept="image/*" onChange={(e) => onUpload?.(e.target.files?.[0])} />
          </Button>
          <Button variant="outlined" color="error" size="small" startIcon={<DeleteOutlineOutlinedIcon fontSize="small" />} onClick={onRemove}>
            Remove
          </Button>
        </Stack>

        {logoName && (
          <Typography variant="caption" noWrap title={logoName} sx={{ color: 'text.secondary', maxWidth: '100%' }}>
            {logoName}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}
