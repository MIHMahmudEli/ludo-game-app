import { useWindowDimensions } from 'react-native';
import { BOARD_GRID_SIZE } from '@/constants';

/**
 * Compute a square board size that fits the current viewport, with a sane
 * minimum (small phones) and a cap (so the board doesn't become enormous on
 * tablets). Returns the board size and the derived per-cell size.
 */
export function useResponsiveBoard() {
  const { width, height } = useWindowDimensions();
  // Leave room for the header and the two dice-box rows above/below the board.
  const available = Math.min(width - 24, height - 330);
  const boardSize = Math.max(240, Math.min(available, 520));
  const cell = boardSize / BOARD_GRID_SIZE;
  return { boardSize, cell };
}
