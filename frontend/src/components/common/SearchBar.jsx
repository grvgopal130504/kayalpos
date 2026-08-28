import { InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

/**
 * Reusable search input (used as the global topbar search today; the same
 * component should be used for any in-page search/filter bar later).
 */
export default function SearchBar({ placeholder = 'Search…', value, onChange, sx, ...rest }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        borderColor: 'divider',
        bgcolor: 'background.default',
        ...sx,
      }}
    >
      <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
      <InputBase
        fullWidth
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        sx={{ fontSize: 14 }}
        {...rest}
      />
    </Paper>
  );
}
