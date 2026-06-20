import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BOARD_GRID_SIZE } from '@/constants';

/**
 * Compute a square board size that fits the current viewport on any device,
 * mobile-first. Reserves space for the safe-area insets, the quit header and
 * the two dice-box rows above/below the board, so the board stays centred and
 * every player zone is fully visible without overlap.
 */
export function useResponsiveBoard() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Vertical chrome: safe areas + header (~56) + two dice-box rows & gaps (~180).
  const verticalChrome = insets.top + insets.bottom + 56 + 180;
  const heightBudget = height - verticalChrome;
  const widthBudget = width - 24;

  const boardSize = Math.max(220, Math.min(widthBudget, heightBudget, 540));
  const cell = boardSize / BOARD_GRID_SIZE;
  return { boardSize, cell };
}
