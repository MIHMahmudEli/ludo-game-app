import type { PlayerColor } from '@/types';

/** Tokens per player. */
export const TOKENS_PER_PLAYER = 4;

/** Number of cells on the shared outer ring. */
export const MAIN_TRACK_LENGTH = 52;

/**
 * Relative-position model along a single colour's path (see `Token.position`):
 *   0 .............. LAST_TRACK_POS   -> shared ring (51 cells)
 *   LAST_TRACK_POS+1 .. HOME_POSITION -> home column (6 cells, last = centre)
 */
export const LAST_TRACK_POS = 50; // ring positions 0..50 inclusive
export const HOME_COLUMN_LENGTH = 6; // positions 51..56
export const HOME_POSITION = LAST_TRACK_POS + HOME_COLUMN_LENGTH; // 56 (finished)
export const FIRST_HOME_COLUMN_POS = LAST_TRACK_POS + 1; // 51

/** Each colour's entry cell index on the shared ring (clockwise layout). */
export const ENTRY_INDEX: Record<PlayerColor, number> = {
  red: 0,
  green: 13,
  yellow: 26,
  blue: 39,
};

/**
 * Globally safe ring cells where tokens cannot be captured:
 * the four start cells (0,13,26,39) and the four "star" cells 8 ahead of each.
 */
export const SAFE_RING_INDICES: readonly number[] = [0, 8, 13, 21, 26, 34, 39, 47];

/** Dice value that releases a token from the base and grants an extra turn. */
export const DICE_EXIT_VALUE = 6;

/** Three sixes in a row forfeits the whole turn. */
export const MAX_CONSECUTIVE_SIXES = 3;
