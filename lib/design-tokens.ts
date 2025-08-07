/**
 * Design tokens extracted from full-card.svg
 * These values define the visual system for card components
 */

export const cardDesignTokens = {
  // Card dimensions from SVG viewBox
  dimensions: {
    // Original SVG dimensions
    originalWidth: 680,
    originalHeight: 530,
    // Responsive card sizes
    compact: {
      width: 320,
      height: 240,
    },
    standard: {
      width: 400,
      height: 300,
    },
    expanded: {
      width: 680,
      height: 530,
    },
  },

  // Color palette from SVG analysis
  colors: {
    // Primary green from SVG (#2AA760)
    primary: '#2AA760',
    // Dark green variant (#0F5A29)
    primaryDark: '#0F5A29',
    // Light green variant (#ACE3BF)
    primaryLight: '#ACE3BF',
    // Background and text
    background: '#FFFFFF',
    text: '#000000',
    // Card border and accent
    border: '#2AA760',
    accent: '#2AA760',
  },

  // Typography scale (estimated from SVG text elements)
  typography: {
    title: {
      fontSize: '1.5rem',
      fontWeight: '700',
      lineHeight: '1.2',
    },
    caption: {
      fontSize: '0.875rem',
      fontWeight: '500',
      lineHeight: '1.4',
    },
    body: {
      fontSize: '0.875rem',
      fontWeight: '400',
      lineHeight: '1.5',
    },
    prompt: {
      fontSize: '0.8125rem',
      fontWeight: '400',
      lineHeight: '1.4',
    },
  },

  // Spacing system
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },

  // Border radius
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.25rem',
  },

  // Box shadow (estimated from SVG effects)
  shadows: {
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  },

  // Animation durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
} as const;

// Category-specific styling
export const categoryStyles = {
  'cognitive-bias': {
    primary: '#2AA760',
    light: '#ACE3BF',
    dark: '#0F5A29',
  },
  'social-bias': {
    primary: '#3B82F6',
    light: '#DBEAFE',
    dark: '#1E40AF',
  },
  'statistical-bias': {
    primary: '#EF4444',
    light: '#FEE2E2',
    dark: '#B91C1C',
  },
  'mitigation-technique': {
    primary: '#F59E0B',
    light: '#FEF3C7',
    dark: '#D97706',
  },
} as const;

export type CategoryType = keyof typeof categoryStyles;
