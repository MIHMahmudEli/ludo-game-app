import { useWindowDimensions } from 'react-native';
import { BOARD_GRID_SIZE } from '@/constants';

/**
 * Compute a square board size that fits the current viewport, with a sane
 * minimum (small phones) and a cap (so the board doesn't become enormous on
 * tablets). Returns the board size and the derived per-cell size.
 */
export function useResponsiveBoard() {
  const { width, height } = useWindowDimensions();
  // Leave room for the header and for dice that overhang the board corners.
  const budget = Math.min(width - 16, height - 260);
  const boardSize = Math.max(240, Math.min(budget * 0.86, 520));
  const cell = boardSize / BOARD_GRID_SIZE;
  return { boardSize, cell };
}
