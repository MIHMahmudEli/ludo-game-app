import type { PlayerColor } from '@/types';
import {
  ENTRY_INDEX,
  FIRST_HOME_COLUMN_POS,
  HOME_POSITION,
  LAST_TRACK_POS,
  MAIN_TRACK_LENGTH,
} from './game';

/**
 * Board geometry — the ONLY place that knows about pixels/grid coordinates.
 *
 * The board is the classic 15x15 Ludo grid. Row 0 is the top, column 0 the
 * left. Coordinates are `[row, col]` and may be fractional (base slots) so the
 * renderer can centre tokens nicely.
 *
 * Nothing here knows any game *rule* — it is a pure spatial lookup table that
 * the engine's relative `position` model is projected onto for display.
 */

export const BOARD_GRID_SIZE = 15;

export type GridCoord = readonly [row: number, col: number];

/** Centre of the board (the home triangle). */
export const CENTER_COORD: GridCoord = [7, 7];

/**
 * The 52 shared ring cells in clockwise order, index 0..51.
 * Entry cells: red=0, green=13, yellow=26, blue=39 (see ENTRY_INDEX).
 */
export const RING_COORDS: readonly GridCoord[] = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], //  0- 4  red start arm
  [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], //  5-10
  [0, 7], // 11
  [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], // 12-17  green start arm
  [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], // 18-23
  [7, 14], // 24
  [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], // 25-30  yellow start arm
  [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], // 31-36
  [14, 7], // 37
  [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], // 38-43  blue start arm
  [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], // 44-49
  [7, 0], // 50
  [6, 0], // 51
];

/** Home columns (6 cells), travelled at relative positions 51..56. */
export const HOME_COLUMN_COORDS: Record<PlayerColor, readonly GridCoord[]> = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

/** Four yard slots per colour (fractional centres for nice spacing). */
export const BASE_SLOT_COORDS: Record<PlayerColor, readonly GridCoord[]> = {
  red: [[1.3, 1.3], [1.3, 3.7], [3.7, 1.3], [3.7, 3.7]],
  green: [[1.3, 10.3], [1.3, 12.7], [3.7, 10.3], [3.7, 12.7]],
  yellow: [[10.3, 10.3], [10.3, 12.7], [12.7, 10.3], [12.7, 12.7]],
  blue: [[10.3, 1.3], [10.3, 3.7], [12.7, 1.3], [12.7, 3.7]],
};

/** Top-left origin + size (in grid cells) of each colour's 6x6 yard quadrant. */
export const BASE_QUADRANT: Record<
  PlayerColor,
  { row: number; col: number; size: number }
> = {
  red: { row: 0, col: 0, size: 6 },
  green: { row: 0, col: 9, size: 6 },
  yellow: { row: 9, col: 9, size: 6 },
  blue: { row: 9, col: 0, size: 6 },
};

/**
 * Project a colour-relative position onto a global ring index.
 * Returns `null` when the position is inside the home column (off the ring).
 */
export function ringIndexForPosition(
  color: PlayerColor,
  position: number,
): number | null {
  if (position < 0 || position > LAST_TRACK_POS) return null;
  return (ENTRY_INDEX[color] + position) % MAIN_TRACK_LENGTH;
}

/**
 * Project an active token's relative position (0..56) to a grid coordinate.
 * Callers must only pass positions of tokens whose state is `active`/`home`.
 */
export function coordForPosition(color: PlayerColor, position: number): GridCoord {
  const ringIndex = ringIndexForPosition(color, position);
  if (ringIndex !== null) {
    return RING_COORDS[ringIndex]!;
  }
  // Home column: positions FIRST_HOME_COLUMN_POS..HOME_POSITION.
  const clamped = Math.min(position, HOME_POSITION);
  const homeIndex = clamped - FIRST_HOME_COLUMN_POS;
  return HOME_COLUMN_COORDS[color][homeIndex]!;
}

/** Grid coordinate of a token sitting in its yard slot. */
export function baseSlotCoord(color: PlayerColor, tokenIndex: number): GridCoord {
  return BASE_SLOT_COORDS[color][tokenIndex]!;
}
