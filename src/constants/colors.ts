import type { PlayerColor } from '@/types';

/**
 * Canonical player palette. Kept deliberately in sync with the `player.*`
 * colours declared in `tailwind.config.js` so SVG fills (which can't use
 * className) and Tailwind classes never drift apart.
 */
// Classic bright Ludo palette (matches the reference board art).
export const PLAYER_HEX: Record<PlayerColor, string> = {
  red: '#E53935',
  green: '#2FA84F',
  yellow: '#F4B400',
  blue: '#2A7FE0',
};

/** Slightly darker shade used for token rims / base borders. */
export const PLAYER_HEX_DARK: Record<PlayerColor, string> = {
  red: '#B71C1C',
  green: '#1E7E37',
  yellow: '#D69600',
  blue: '#1B5FB5',
};

/** Lighter tint used for the top of glossy 3D token highlights. */
export const PLAYER_HEX_LIGHT: Record<PlayerColor, string> = {
  red: '#EF5350',
  green: '#54C46E',
  yellow: '#FFC83D',
  blue: '#4F9BEE',
};

/** Soft tint used to fill each colour's home quadrant. */
export const PLAYER_HEX_SOFT: Record<PlayerColor, string> = {
  red: '#FBD2D1',
  green: '#C6EBCF',
  yellow: '#FCE9B8',
  blue: '#C2DDF7',
};

export const BOARD_HEX = {
  light: { background: '#FFFFFF', cell: '#FFFFFF', grid: '#E2E8F0' },
  dark: { background: '#0B1120', cell: '#111827', grid: '#1F2937' },
} as const;

/** Glossy wooden frame around the board (a gradient pair per scheme). */
export const BOARD_FRAME = {
  light: ['#C8923F', '#8A5A22'] as const, // warm wood
  dark: ['#3B3024', '#1C160F'] as const, // dark walnut
} as const;
