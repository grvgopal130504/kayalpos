import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Stack, Box, Typography, Breadcrumbs, Link as MuiLink, Grid, Paper, Tabs, Tab,
  Button, Menu, MenuItem,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { useAppDispatch } from '../../../app/hooks';
import { logout } from '../../../features/auth/authSlice';
import { showToast } from '../../../features/ui/uiSlice';
import FormTextField from '../../../components/form/FormTextField';
import FormSelect from '../../../components/form/FormSelect';

import ContactPersonTable from '../company/components/ContactPersonTable';
import WarehouseLogoCard from './components/WarehouseLogoCard';
import WarehouseCapacityCard from './components/WarehouseCapacityCard';
import WarehouseInchargeCard from './components/WarehouseInchargeCard';
import { CASHIER } from '../mastersMockData';
import { CONTACT_PERSONS } from './warehouseMockData';
import {
  createWarehouseSchema, createWarehouseDefaultValues,
  WAREHOUSE_TYPE_OPTIONS, LOCATION_OPTIONS, COMPANY_OPTIONS, OUTLET_OPTIONS,
  STATE_OPTIONS, COUNTRY_OPTIONS, STATUS_OPTIONS,
} from './createWarehouseSchema';

const TABS = ['Warehouse Details', 'Additional Information', 'Financial Information', 'Settings', 'Document', 'Activity Log'];

/**
 * Warehouse — the Warehouse master's detail/edit screen, reached from the
 * Masters page's "Warehouse" card. Same tabbed, view-then-Edit-to-unlock
 * shape as the Company/Outlet masters, but the right sidebar swaps
 * Registered Address for Warehouse Capacity (Total/Used/Available, with
 * Available computed live) and Warehouse Incharge, and the address lives
 * inline in Basic Information as a multiline field instead of its own
 * card. Only "Warehouse Details" has real content; the other five tabs
 * are placeholders. Saving and every row/contact action are mocked —
 * there's no Warehouse backend module yet.
 */
export default function WarehousePage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [logoName, setLogoName] = useState('');

  const methods = useForm({
    resolver: zodResolver(createWarehouseSchema),
    defaultValues: createWarehouseDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNewWarehouse = () => dispatch(showToast('New Warehouse form is coming soon', 'info'));
  const handleEdit = () => setIsEditing(true);
  const handleMoreAction = (label) => {
    setMoreAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };
  const handleAddContact = () => dispatch(showToast('Add Contact Person is coming soon', 'info'));
  const handleEditContact = (row) => dispatch(showToast(`Edit ${row.name} is coming soon`, 'info'));
  const handleDeleteContact = (row) => dispatch(showToast(`Delete ${row.name} is coming soon`, 'info'));
  const handleEditIncharge = () => dispatch(showToast('Edit Warehouse Incharge is coming soon', 'info'));
  const handleLogoUpload = (file) => setLogoName(file?.name || '');
  const handleLogoRemove = () => setLogoName('');

  const onSave = handleSubmit((values) => {
    setIsEditing(false);
    dispatch(showToast(`${values.warehouseName} saved successfully`, 'success'));
  });
  const disabledProps = { disabled: !isEditing };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Warehouse</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Warehouse</Typography>
          </Breadcrumbs>
        </Box>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#2563EB' }}>
            Cashier : {CASHIER.name} ({CASHIER.code})
          </Typography>
          <MuiLink
            component="button"
            type="button"
            variant="body2"
            underline="hover"
            onClick={handleLogout}
            sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.5, color: '#2563EB' }}
          >
            <LogoutOutlinedIcon fontSize="inherit" /> Logout
          </MuiLink>
        </Stack>
      </Stack>

      <Paper variant="outlined" sx={{ borderRadius: 3, px: { xs: 1, sm: 1.5 } }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { xs: 'stretch', lg: 'center' }, justifyContent: 'space-between', py: { xs: 1, lg: 0 } }}
        >
          <Tabs
            value={activeTab}
            onChange={(_e, value) => setActiveTab(value)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 48 }}
          >
            {TABS.map((label) => (
              <Tab key={label} label={label} sx={{ fontWeight: 700, textTransform: 'none', minHeight: 48 }} />
            ))}
          </Tabs>

          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', py: { xs: 1, lg: 1.5 }, justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
            <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewWarehouse}>
              New Warehouse
            </Button>
            <Button variant="outlined" color="primary" startIcon={<EditOutlinedIcon fontSize="small" />} onClick={handleEdit} disabled={isEditing}>
              Edit
            </Button>
            <Button variant="outlined" color="primary" startIcon={<SaveOutlinedIcon fontSize="small" />} onClick={onSave} disabled={!isEditing}>
              Save
            </Button>
            <Button variant="outlined" color="primary" endIcon={<ExpandMoreIcon fontSize="small" />} onClick={(e) => setMoreAnchor(e.currentTarget)}>
              More
            </Button>
            <Menu anchorEl={moreAnchor} open={Boolean(moreAnchor)} onClose={() => setMoreAnchor(null)}>
              <MenuItem onClick={() => handleMoreAction('Duplicate Warehouse')}>Duplicate Warehouse</MenuItem>
              <MenuItem onClick={() => handleMoreAction('Export Details')}>Export Details</MenuItem>
              <MenuItem onClick={() => handleMoreAction('Deactivate Warehouse')}>Deactivate Warehouse</MenuItem>
            </Menu>
          </Stack>
        </Stack>
      </Paper>

      {activeTab === 0 ? (
        <FormProvider {...methods}>
          <Stack spacing={2} component="form" noValidate>
            <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
              <Grid size={{ xs: 12, lg: 8 }}>
                <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Basic Information</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="warehouseCode" label="Warehouse Code *" {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect name="warehouseType" label="Warehouse Type *" options={WAREHOUSE_TYPE_OPTIONS} {...disabledProps} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="warehouseName" label="Warehouse Name *" {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect name="location" label="Location" options={LOCATION_OPTIONS} {...disabledProps} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect name="company" label="Company *" options={COMPANY_OPTIONS} {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect name="state" label="State *" options={STATE_OPTIONS} {...disabledProps} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect name="outlet" label="Outlet *" options={OUTLET_OPTIONS} {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect name="country" label="Country *" options={COUNTRY_OPTIONS} {...disabledProps} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="address" label="Address *" multiline minRows={3} {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="pincode" label="Pincode *" {...disabledProps} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="landmark" label="Landmark" {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect name="status" label="Status *" options={STATUS_OPTIONS} {...disabledProps} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={2}>
                  <WarehouseLogoCard
                    warehouseName={createWarehouseDefaultValues.warehouseName}
                    logoName={logoName}
                    onUpload={handleLogoUpload}
                    onRemove={handleLogoRemove}
                  />
                  <WarehouseCapacityCard disabled={!isEditing} />
                  <WarehouseInchargeCard disabled={!isEditing} onEdit={handleEditIncharge} />
                </Stack>
              </Grid>
            </Grid>

            <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main', mb: 2 }}>Contact Person</Typography>
              <ContactPersonTable
                rows={CONTACT_PERSONS}
                onAdd={handleAddContact}
                onEditRow={handleEditContact}
                onDeleteRow={handleDeleteContact}
              />
            </Paper>
          </Stack>
        </FormProvider>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{TABS[activeTab]}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            This section is coming soon.
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
