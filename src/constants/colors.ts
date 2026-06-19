import type { PlayerColor } from '@/types';

/**
 * Canonical player palette. Kept deliberately in sync with the `player.*`
 * colours declared in `tailwind.config.js` so SVG fills (which can't use
 * className) and Tailwind classes never drift apart.
 */
export const PLAYER_HEX: Record<PlayerColor, string> = {
  red: '#EF4444',
  green: '#22C55E',
  yellow: '#F59E0B',
  blue: '#3B82F6',
};

/** Slightly darker shade used for token rims / base borders. */
export const PLAYER_HEX_DARK: Record<PlayerColor, string> = {
  red: '#B91C1C',
  green: '#15803D',
  yellow: '#B45309',
  blue: '#1D4ED8',
};

/** Soft tint used to fill each colour's home quadrant. */
export const PLAYER_HEX_SOFT: Record<PlayerColor, string> = {
  red: '#FCA5A5',
  green: '#86EFAC',
  yellow: '#FCD34D',
  blue: '#93C5FD',
};

export const BOARD_HEX = {
  light: { background: '#FFFFFF', cell: '#FFFFFF', grid: '#E2E8F0' },
  dark: { background: '#0B1120', cell: '#111827', grid: '#1F2937' },
} as const;
