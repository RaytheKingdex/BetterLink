// src/theme/index.js
// BetterLink Design System — Mobile

export const Colors = {
  // Brand
  primary: '#1A56DB',       // Royal blue — trust, professionalism
  primaryDark: '#1044B2',
  primaryLight: '#EBF1FF',
  accent: '#00C896',        // Jamaican-inspired teal-green
  accentLight: '#E6FAF5',

  // Neutrals
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E4E7EC',
  borderLight: '#F2F4F7',

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
