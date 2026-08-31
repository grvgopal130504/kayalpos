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

import RegisteredAddressCard from '../company/components/RegisteredAddressCard';
import ContactPersonTable from '../company/components/ContactPersonTable';
import OutletLogoCard from './components/OutletLogoCard';
import { CASHIER } from '../mastersMockData';
import { REGISTERED_ADDRESS, CONTACT_PERSONS } from './outletMockData';
import {
  createOutletSchema, createOutletDefaultValues,
  OUTLET_TYPE_OPTIONS, COMPANY_OPTIONS, STATE_OPTIONS, CITY_OPTIONS, STATUS_OPTIONS,
} from './createOutletSchema';

const TABS = ['Outlet Details', 'Additional Information', 'Financial Information', 'Settings', 'Document', 'Activity Log'];

/**
 * Outlet — the Outlet master's detail/edit screen, reached from the
 * Masters page's "Outlet" card. Same shape as the Company master's page
 * (tabs + Basic Information / Contact Person on the left, Logo /
 * Registered Address on the right, view-then-Edit-to-unlock fields), with
 * outlet-specific fields (Outlet Type, parent Company, City, Status)
 * replacing Company's own registration fields. Only "Outlet Details" has
 * real content; the other five tabs are placeholders — there's no
 * Additional/Financial/Settings/Document/Activity Log data modeled yet.
 * Saving and every row/contact action are mocked — there's no Outlet
 * backend module yet.
 */
export default function OutletPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [moreAnchor, setMoreAnchor] = useState(null);
  const [logoName, setLogoName] = useState('');

  const methods = useForm({
    resolver: zodResolver(createOutletSchema),
    defaultValues: createOutletDefaultValues,
    mode: 'onTouched',
  });
  const { handleSubmit } = methods;

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  const handleNewOutlet = () => dispatch(showToast('New Outlet form is coming soon', 'info'));
  const handleEdit = () => setIsEditing(true);
  const handleMoreAction = (label) => {
    setMoreAnchor(null);
    dispatch(showToast(`${label} is coming soon`, 'info'));
  };
  const handleAddContact = () => dispatch(showToast('Add Contact Person is coming soon', 'info'));
  const handleEditContact = (row) => dispatch(showToast(`Edit ${row.name} is coming soon`, 'info'));
  const handleDeleteContact = (row) => dispatch(showToast(`Delete ${row.name} is coming soon`, 'info'));
  const handleEditAddress = () => dispatch(showToast('Edit Registered Address is coming soon', 'info'));
  const handleLogoUpload = (file) => setLogoName(file?.name || '');
  const handleLogoRemove = () => setLogoName('');

  const onSave = handleSubmit((values) => {
    setIsEditing(false);
    dispatch(showToast(`${values.outletName} saved successfully`, 'success'));
  });
  const disabledProps = { disabled: !isEditing };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Outlet</Typography>
          <Breadcrumbs separator={<NavigateNextIcon sx={{ fontSize: 14 }} />} sx={{ '& .MuiTypography-root, & .MuiLink-root': { fontSize: 12.5 } }}>
            <MuiLink component={RouterLink} to="/home" underline="hover" color="text.secondary">Home</MuiLink>
            <MuiLink component={RouterLink} to="/masters" underline="hover" color="text.secondary">Masters</MuiLink>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Outlet</Typography>
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
            <Button variant="contained" color="primary" startIcon={<AddIcon fontSize="small" />} onClick={handleNewOutlet}>
              New Outlet
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
              <MenuItem onClick={() => handleMoreAction('Duplicate Outlet')}>Duplicate Outlet</MenuItem>
              <MenuItem onClick={() => handleMoreAction('Export Details')}>Export Details</MenuItem>
              <MenuItem onClick={() => handleMoreAction('Deactivate Outlet')}>Deactivate Outlet</MenuItem>
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
                      <FormTextField name="outletCode" label="Outlet Code *" {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect name="outletType" label="Outlet Type *" options={OUTLET_TYPE_OPTIONS} {...disabledProps} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="outletName" label="Outlet Name *" {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect name="company" label="Company *" options={COMPANY_OPTIONS} {...disabledProps} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="registrationNo" label="Registration No." {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect name="state" label="State *" options={STATE_OPTIONS} {...disabledProps} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="gstin" label="GSTIN *" {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect name="city" label="City *" options={CITY_OPTIONS} {...disabledProps} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="panNo" label="PAN No." {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="phone" label="Phone *" {...disabledProps} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="email" label="Email" {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="mobile" label="Mobile *" {...disabledProps} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormTextField name="website" label="Website" {...disabledProps} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <FormSelect name="status" label="Status *" options={STATUS_OPTIONS} {...disabledProps} />
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 4 }}>
                <Stack spacing={2}>
                  <OutletLogoCard
                    outletName={createOutletDefaultValues.outletName}
                    logoName={logoName}
                    onUpload={handleLogoUpload}
                    onRemove={handleLogoRemove}
                  />
                  <RegisteredAddressCard address={REGISTERED_ADDRESS} onEdit={handleEditAddress} />
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
