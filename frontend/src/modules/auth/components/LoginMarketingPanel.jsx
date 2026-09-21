import { Box, Stack, Typography, Paper } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import InsightsIcon from '@mui/icons-material/Insights';
import GroupsIcon from '@mui/icons-material/Groups';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import StoreIcon from '@mui/icons-material/Store';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AppLogo from '../../../components/common/AppLogo';

const FEATURES = [
  { icon: BoltIcon, label: 'Fast\nBilling' },
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
 * Text/branding overlay for the login screen's full-bleed background photo
 * (the photo itself, plus the readability scrim behind this, are rendered
 * once by LoginPage so they can span the *entire* viewport — including the
 * area behind the floating login card — rather than just this panel).
 * Desktop only (LoginPage hides this below `md`). The brand mark, headline,
 * feature icons, stats bar and copyright each sit on their own
 * translucent/blurred card so the text stays readable no matter what part
 * of the image is behind it.
 */
export default function LoginMarketingPanel() {
  return (
    <Box sx={{ position: 'relative', height: '100%', width: '100%' }}>
      {/* Content — layered above the photo (painted by the parent). */}
      <Stack
        sx={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          width: '100%',
          justifyContent: 'space-between',
          py: 2,
        }}
      >
        {/* Copy */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 780,
            mx: 'auto',
            px: 12,
          }}
        >
            <Box sx={{ mb: 0.75 }}>
              <AppLogo iconSize={40} titleFontSize="1.25rem" subtitleFontSize="0.70rem" />
            </Box>
            <Typography
              sx={{
                fontWeight: 800,
                color: '#2c2b2b',
                lineHeight: 1.2,
                fontSize: '1.35rem',
                textShadow: '0 1px 6px rgba(255,255,255,0.85), 0 1px 3px rgba(255,255,255,0.85)',
              }}
            >
              Empowering Your Business
            </Typography>
            <Typography
              sx={{
                fontWeight: 800,
                color: 'primary.main',
                lineHeight: 1.2,
                fontSize: '1.35rem',
                textShadow: '0 1px 6px rgba(255,255,255,0.85), 0 1px 3px rgba(255,255,255,0.85)',
              }}
            >
              Every Sale. Every Day.
            </Typography>
            <Typography
              sx={{
                mt: 0.75,
                color: 'text.secondary',
                maxWidth: 470,
                fontSize: '0.8125rem',
                textShadow: '0 1px 6px rgba(255,255,255,0.85), 0 1px 3px rgba(255,255,255,0.85)',
              }}
            >
              Smart POS solutions to simplify billing,
            </Typography>
            <Typography
              sx={{
                color: 'text.secondary',
                maxWidth: 470,
                fontSize: '0.8125rem',
                textShadow: '0 1px 6px rgba(255,255,255,0.85), 0 1px 3px rgba(255,255,255,0.85)',
              }}
            >
              inventory and grow your business.
            </Typography>

            <Stack
              direction="row"
              spacing={2.25}
              useFlexGap
              sx={{ mt: 1.4, flexWrap: 'wrap' }}
            >
            {FEATURES.map(({ icon: Icon, label }) => (
              <Stack key={label} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box
                  sx={{
                    flexShrink: 0,
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    bgcolor: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                  }}
                >
                  <Icon fontSize="small" />
                </Box>
                <Typography
                  variant="caption"
                  align="left"
                  sx={{
                    color: '#313030',
                    fontWeight: 600,
                    lineHeight: 1.2,
                    fontSize: 11,
                    borderRadius: 0.75,
                    maxWidth: 64,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>

        {/* Spacer so the copy stays pinned to the top and the stats bar to
            the bottom, with the photo showing through the middle. */}
        <Box sx={{ flex: 1, minHeight: 0 }} />

        {/* Stats bar + copyright */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 780,
            mx: 'auto',
            px: 4,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 3,
              mx: 'auto',
              width: 'fit-content',
              maxWidth: '100%',
              px: 3.5,
              py: 1.4,
              borderRadius: 4,
              // Glassmorphism: low-opacity white + heavy blur/saturation so
              // the photo behind still reads through, a soft outer shadow
              // for lift, and a bright inset top edge to sell the "glass"
              // highlight you'd see on a real frosted pane.
              bgcolor: 'rgba(255, 255, 255, 0)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.6)',
            }}
          >
            {STATS.map(({ icon: Icon, value, label }) => (
              <Stack key={label} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <Icon sx={{ color: 'red', fontSize: 23 }} />
                <Stack spacing={0}>
                  <Typography sx={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3, color: 'black' }}>{value}</Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'black', textAlign: 'left', fontSize: 10, lineHeight: 1.2 }}
                  >
                    {label}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Paper>
          <Typography
            variant="caption"
            align="center"
            sx={{
              display: 'block',
              color: '#302e2e',
              mt: 1,
              fontSize: 11,
              fontWeight: 500,
              textShadow: '0 1px 4px rgba(255,255,255,0.9), 0 1px 4px rgba(255,255,255,0.9)',
            }}
          >
            © 2026 Techconz Nexora Pvt Ltd. All Rights Reserved.
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}
