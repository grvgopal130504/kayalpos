import { Box, Stack, Typography, Paper } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import InsightsIcon from '@mui/icons-material/Insights';
import GroupsIcon from '@mui/icons-material/Groups';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import StoreIcon from '@mui/icons-material/Store';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import loginImage from '../../../assets/Login Image.png';

const FEATURES = [
  { icon: BoltIcon, label: 'Fast Billing' },
  { icon: Inventory2Icon, label: 'Smart Inventory' },
  { icon: InsightsIcon, label: 'Real-time Reports' },
  { icon: GroupsIcon, label: 'Happy Customers' },
];

const STATS = [
  { icon: StorefrontIcon, value: '1000+', label: 'Products' },
  { icon: PeopleAltIcon, value: '5000+', label: 'Happy Customers' },
  { icon: StoreIcon, value: '50+', label: 'Outlets' },
  { icon: TrendingUpIcon, value: '99.9%', label: 'System Uptime' },
];

/**
 * Full-bleed left half of the login screen (desktop only — LoginPage hides it
 * below `md`). Plain light background with the copy up top, the tenant's
 * product photo centered in the middle as its own image (not a cropped
 * background), and the stats bar + copyright anchored at the bottom.
 */
export default function LoginMarketingPanel() {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Stack
        sx={{
          position: 'relative',
          height: '100%',
          width: '100%',
          justifyContent: 'space-between',
          py: { md: 3, lg: 4.5 },
        }}
      >
        {/* Copy — kept to the same comfortable column width as the form on
            the other side of the screen */}
        <Box
          sx={{
            width: '100%',
            maxWidth: { md: 780, xl: 940 },
            mx: 'auto',
            px: { md: 4, lg: 6 },
          }}
        >
          <Typography
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              lineHeight: 1.2,
              fontSize: { md: '1.6rem', lg: '2rem' },
            }}
          >
            Empowering Your Business
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              color: 'primary.main',
              lineHeight: 1.2,
              fontSize: { md: '1.6rem', lg: '2rem' },
            }}
          >
            Every Sale. Every Day.
          </Typography>
          <Typography
            sx={{
              mt: 1.25,
              color: 'text.secondary',
              maxWidth: 470,
              fontSize: { md: '0.875rem', lg: '0.95rem' },
            }}
          >
            Smart POS solutions to simplify billing, inventory and grow your business.
          </Typography>

          <Stack
            direction="row"
            spacing={{ md: 2.5, lg: 3 }}
            useFlexGap
            sx={{ mt: { md: 2, lg: 2.5 }, flexWrap: 'wrap' }}
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <Stack key={label} spacing={0.75} sx={{ width: 84, alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 46,
                    height: 46,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    bgcolor: 'background.paper',
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Typography
                  variant="caption"
                  align="center"
                  sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.25, fontSize: 11.5 }}
                >
                  {label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Product photo — breaks out to the full panel width (wider than the
            text column above/below it) so it renders as large as possible.
            `contain`, not `cover`, so the whole photo — including the KAYAL
            logo near the top — always stays fully visible with no cropping. */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: { md: 2, lg: 3 },
            py: { md: 1, lg: 1.5 },
          }}
        >
          <Box
            component="img"
            src={loginImage}
            alt="Kayal Agro Foods products"
            sx={{
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              mx: 'auto',
            }}
          />
        </Box>

        {/* Stats bar + copyright */}
        <Box
          sx={{
            width: '100%',
            maxWidth: { md: 780, xl: 940 },
            mx: 'auto',
            px: { md: 4, lg: 6 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              px: { md: 2, lg: 3 },
              py: { md: 1.25, lg: 1.75 },
              borderRadius: 3,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            }}
          >
            {STATS.map(({ icon: Icon, value, label }) => (
              <Stack key={label} spacing={0.25} sx={{ alignItems: 'center' }}>
                <Icon sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography sx={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.3 }}>{value}</Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', textAlign: 'center', fontSize: 10.5, lineHeight: 1.2 }}
                >
                  {label}
                </Typography>
              </Stack>
            ))}
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}
