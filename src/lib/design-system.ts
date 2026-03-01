/**
 * PlaySync Design System
 * Professional Hybrid Modern Tech Style (SaaS meets Gaming)
 * Inspired by: Discord, Riot Games, Modern Gaming Dashboards
 */

// ===================================
// 🎨 COLOR PALETTE
// ===================================

export const colors = {
  // Primary (Emerald - Success & Gaming Energy)
  primary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',  // Main primary
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },

  // Secondary (Slate - Professional & Clean)
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Accent (Purple - Gaming Premium)
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // Status Colors
  success: {
    light: '#d1fae5',
    DEFAULT: '#10b981',
    dark: '#065f46',
  },

  error: {
    light: '#fee2e2',
    DEFAULT: '#ef4444',
    dark: '#991b1b',
  },

  warning: {
    light: '#fef3c7',
    DEFAULT: '#f59e0b',
    dark: '#92400e',
  },

  info: {
    light: '#dbeafe',
    DEFAULT: '#3b82f6',
    dark: '#1e40af',
  },

  // Semantic Colors
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc',
    tertiary: '#f1f5f9',
  },

  text: {
    primary: '#0f172a',
    secondary: '#475569',
    tertiary: '#94a3b8',
    inverse: '#ffffff',
  },

  border: {
    light: '#f1f5f9',
    DEFAULT: '#e2e8f0',
    dark: '#cbd5e1',
  },
} as const;

// ===================================
// 📏 SPACING SCALE (8px grid)
// ===================================

export const spacing = {
  0: '0px',
  0.5: '0.125rem',    // 2px
  1: '0.25rem',       // 4px
  1.5: '0.375rem',    // 6px
  2: '0.5rem',        // 8px
  2.5: '0.625rem',    // 10px
  3: '0.75rem',       // 12px
  3.5: '0.875rem',    // 14px
  4: '1rem',          // 16px
  5: '1.25rem',       // 20px
  6: '1.5rem',        // 24px
  7: '1.75rem',       // 28px
  8: '2rem',          // 32px
  9: '2.25rem',       // 36px
  10: '2.5rem',       // 40px
  12: '3rem',         // 48px
  14: '3.5rem',       // 56px
  16: '4rem',         // 64px
  20: '5rem',         // 80px
  24: '6rem',         // 96px
  32: '8rem',         // 128px
} as const;

// ===================================
// 🔲 BORDER RADIUS
// ===================================

export const borderRadius = {
  none: '0',
  sm: '0.375rem',      // 6px
  DEFAULT: '0.5rem',   // 8px
  md: '0.75rem',       // 12px
  lg: '1rem',          // 16px
  xl: '1.5rem',        // 24px
  '2xl': '2rem',       // 32px
  '3xl': '2.5rem',     // 40px
  full: '9999px',
} as const;

// ===================================
// 🌑 SHADOW SYSTEM
// ===================================

export const shadows = {
  // Elevation shadows
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Inner shadow
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

  // Colored shadows (for buttons, cards with glow)
  primary: '0 10px 25px -5px rgba(16, 185, 129, 0.3)',
  accent: '0 10px 25px -5px rgba(168, 85, 247, 0.3)',
  error: '0 10px 25px -5px rgba(239, 68, 68, 0.3)',
} as const;

// ===================================
// ⚡ ANIMATION DURATIONS
// ===================================

export const animation = {
  instant: '100ms',
  fast: '150ms',
  DEFAULT: '200ms',
  moderate: '300ms',
  slow: '500ms',
  verySlow: '700ms',
} as const;

export const easings = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
} as const;

// ===================================
// 📱 BREAKPOINTS
// ===================================

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ===================================
// 🔤 TYPOGRAPHY
// ===================================

export const typography = {
  fontFamily: {
    sans: '"Poppins", system-ui, -apple-system, sans-serif',
    mono: '"Fira Code", "Courier New", monospace',
  },

  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },

  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },

  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75',
  },
} as const;

// ===================================
// 🎯 Z-INDEX LAYERS
// ===================================

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
} as const;

// ===================================
// 🎨 COMPONENT PRESETS
// ===================================

export const presets = {
  button: {
    primary: `
      bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
      text-white font-semibold
      rounded-xl px-6 py-3
      shadow-md hover:shadow-lg
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-slate-100 hover:bg-slate-200 active:bg-slate-300
      text-slate-900 font-semibold
      rounded-xl px-6 py-3
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    outline: `
      bg-transparent hover:bg-slate-50 active:bg-slate-100
      text-slate-700 font-semibold
      rounded-xl px-6 py-3
      border-2 border-slate-200 hover:border-slate-300
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
    danger: `
      bg-red-600 hover:bg-red-700 active:bg-red-800
      text-white font-semibold
      rounded-xl px-6 py-3
      shadow-md hover:shadow-lg hover:shadow-red-200
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
    `,
  },

  card: {
    elevated: `
      bg-white rounded-2xl border border-slate-100
      shadow-lg hover:shadow-xl
      transition-shadow duration-300
    `,
    flat: `
      bg-white rounded-2xl border border-slate-100
    `,
    interactive: `
      bg-white rounded-2xl border border-slate-100
      shadow-md hover:shadow-xl hover:border-emerald-200
      transition-all duration-300 cursor-pointer
      transform hover:-translate-y-1
    `,
  },

  input: `
    w-full px-4 py-3
    bg-slate-50 border border-slate-200
    rounded-xl
    text-slate-900 placeholder-slate-400
    focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100
    transition-all duration-200
    outline-none
  `,
} as const;

// ===================================
// 🎭 HELPER FUNCTIONS
// ===================================

/**
 * Get responsive spacing value
 */
export const getSpacing = (size: keyof typeof spacing) => spacing[size];

/**
 * Get color with opacity
 */
export const withOpacity = (color: string, opacity: number) => {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
};

/**
 * Transition helper
 */
export const transition = (
  property: string = 'all',
  duration: keyof typeof animation = 'DEFAULT',
  easing: keyof typeof easings = 'easeInOut'
) => {
  return `${property} ${animation[duration]} ${easings[easing]}`;
};

// Export all as default for easy importing
const designSystem = {
  colors,
  spacing,
  borderRadius,
  shadows,
  animation,
  easings,
  breakpoints,
  typography,
  zIndex,
  presets,
};

export default designSystem;
