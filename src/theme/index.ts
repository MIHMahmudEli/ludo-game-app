import { useColorScheme } from 'nativewind';
import {
  BOARD_HEX,
  PLAYER_HEX,
  PLAYER_HEX_DARK,
  PLAYER_HEX_SOFT,
} from '@/constants';

/**
 * Theme bridge for non-className consumers.
 *
 * NativeWind handles `dark:` variants on components automatically, but SVG
 * fills/strokes need raw hex values. `useGameTheme` resolves the right palette
 * for the active colour scheme so the board renderer stays declarative.
 */
export function useGameTheme() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return {
    isDark,
    board: isDark ? BOARD_HEX.dark : BOARD_HEX.light,
    player: PLAYER_HEX,
    playerDark: PLAYER_HEX_DARK,
    playerSoft: PLAYER_HEX_SOFT,
  } as const;
}

/** Static design tokens (spacing scale in px). */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
