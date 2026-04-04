// src/theme/index.js
// BetterLink Design System — Mobile

export const Colors = {
  // Brand — teal navbar (#0d9488) + cyan active (#00e5ff)
  primary: '#0d9488',
  primaryDark: '#0a7570',
  primaryLight: '#e6f7f5',
  accent: '#00e5ff',
  accentLight: '#e0faff',

  // Neutrals
  background: '#dff0e8',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#b8d9cc',
  borderLight: '#d0ece2',

  // Glass card (caption-box style)
  cardGlass: 'rgba(45, 136, 255, 0.55)',
  cardGlassBorder: 'rgba(204, 87, 199, 0.22)',

  // Sidebar — dark GitHub-style (#0d1117)
  sidebarBg: '#0d1117',
  sidebarSurface: '#161b22',
  sidebarBorder: '#30363d',
  sidebarText: '#e6edf3',
  sidebarTextSecondary: '#8b949e',

  // Text
  textPrimary: '#101828',
  textSecondary: '#475467',
  textTertiary: '#98A2B3',
  textInverse: '#FFFFFF',

  // Status
  success: '#12B76A',
  successLight: '#ECFDF3',
  warning: '#F79009',
  warningLight: '#FFFAEB',
  error: '#F04438',
  errorLight: '#FEF3F2',
  info: '#0BA5EC',
  infoLight: '#F0F9FF',

  // Employment Type Tags
  fullTime: '#175CD3',
  fullTimeLight: '#EFF8FF',
  internship: '#6941C6',
  internshipLight: '#F4F3FF',
  partTime: '#067647',
  partTimeLight: '#ECFDF3',
  contract: '#B54708',
  contractLight: '#FFFAEB',
};

export const Typography = {
  // Sizes
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,

  // Weights
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 999,
};

export const Shadows = {
  sm: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
};

export default { Colors, Typography, Spacing, Radius, Shadows };
