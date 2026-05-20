/**
 * Design tokens ported from the web prototype `styles.css :root`.
 * Keep these in sync with /design-extracted/smib-app design/styles.css.
 */

export const colors = {
  navy: '#0C1A2E',
  navyLight: '#162033',
  teal: '#0E7490',
  tealLight: '#CFFAFE',
  cyan: '#67E8F9',
  yellow: '#F59E0B',
  orange: '#EA580C',
  green: '#22C55E',
  greenDark: '#166534',
  red: '#EF4444',
  white: '#FFFFFF',
  black: '#000000',
  accent: '#0E7490',
  accentGlow: 'rgba(14, 116, 144, 0.4)',

  text: '#FFFFFF',
  textMuted: 'rgba(255, 255, 255, 0.65)',
  textDim: 'rgba(255, 255, 255, 0.4)',
  border: 'rgba(255, 255, 255, 0.10)',
  glass: 'rgba(255, 255, 255, 0.06)',
  glassStrong: 'rgba(255, 255, 255, 0.10)',

  // Avatar palette (cycled for users on lists / leaderboards)
  avatarPalette: ['#F59E0B', '#22C55E', '#0E7490', '#8B5CF6', '#EA580C'],

  // Difficulty pills
  diffEasyFg: '#86EFAC',
  diffEasyBg: 'rgba(22, 101, 52, 0.5)',
  diffMediumFg: '#67E8F9',
  diffMediumBg: 'rgba(14, 116, 144, 0.5)',
  diffHardFg: '#FCD34D',
  diffHardBg: 'rgba(180, 83, 9, 0.5)',
};

export const gradients = {
  // Full-screen app background
  appBg: ['#064E3B', '#0E7490', '#0C4A6E', '#78350F', '#1A3A1A'],
  appBgStops: [0, 0.28, 0.55, 0.8, 1],

  // Standard header gradient
  header: ['#0C1A2E', '#0A2A20', '#0E4A3A'],
  headerStops: [0, 0.6, 1],

  // Project-thumb gradients (matching the prototype's CSS classes)
  teal: ['#0E7490', '#155E75'],
  amber: ['#D97706', '#92400E'],
  greenThumb: ['#15803D', '#166534'],
  purple: ['#7E22CE', '#581C87'],
  redThumb: ['#B91C1C', '#7F1D1D'],

  // Profile heroes per role
  learnerHero: ['#F59E0B', '#EA580C'],
  creatorHero: ['#0E7490', '#155E75'],
  parentHero: ['#15803D', '#166534'],
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 18, // matches --card-radius default
  xl: 24,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const fonts = {
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  display: 'Nunito_700Bold',
  displayBlack: 'Nunito_900Black',
  // Fallbacks — we don't actually load the @expo-google-fonts packages here;
  // when fonts haven't loaded yet, RN falls back to the system font.
};

export const sizes = {
  textXs: 11,
  textSm: 13,
  textMd: 14,
  textLg: 16,
  textXl: 18,
  text2xl: 22,
  text3xl: 28,
  text4xl: 36,
};

/** Map a difficulty string to its pill colors. */
export function diffColors(diff) {
  switch ((diff || '').toLowerCase()) {
    case 'easy':
      return { fg: colors.diffEasyFg, bg: colors.diffEasyBg };
    case 'medium':
      return { fg: colors.diffMediumFg, bg: colors.diffMediumBg };
    case 'hard':
      return { fg: colors.diffHardFg, bg: colors.diffHardBg };
    default:
      return { fg: colors.textMuted, bg: colors.glass };
  }
}

/** Map a prototype thumb-color class to a gradient pair. */
export function thumbGradient(name) {
  switch (name) {
    case 'teal-img':
      return gradients.teal;
    case 'amber-img':
      return gradients.amber;
    case 'green-img':
      return gradients.greenThumb;
    case 'purple-img':
      return gradients.purple;
    case 'red-img':
      return gradients.redThumb;
    default:
      return gradients.teal;
  }
}

/** Stable color pick for an avatar based on a string seed (user id / name). */
export function avatarColor(seed) {
  if (!seed) return colors.avatarPalette[0];
  let h = 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return colors.avatarPalette[h % colors.avatarPalette.length];
}

/** Build initials from a name. "Fazrin Ezan" -> "FE". */
export function initials(name) {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
