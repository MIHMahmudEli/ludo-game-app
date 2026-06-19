import type { DiceValue, Move, Token } from '@/types';
import { DICE_EXIT_VALUE, HOME_POSITION } from '@/constants';
import { replaceWhere } from '@/utils';
import { TokenEngine } from './TokenEngine';

/**
 * MovementEngine — pure geometry of a single token's move.
 *
 * Answers "where would this token land?" and applies that landing immutably.
 * It knows nothing about captures, turns or winning.
 */
export const MovementEngine = {
  /** A base token can only leave on an exact 6. */
  canExitBase(token: Token, dice: DiceValue): boolean {
    return token.state === 'base' && dice === DICE_EXIT_VALUE;
  },

  /**
   * Resulting relative position for moving `token` by `dice`, or `null` when
   * the move is illegal (base without a 6, or overshooting home).
   */
  destination(token: Token, dice: DiceValue): number | null {
    if (token.state === 'home') return null;
    if (token.state === 'base') {
      return this.canExitBase(token, dice) ? 0 : null;
    }
    const next = token.position + dice;
    if (next > HOME_POSITION) return null; // overshoot — exact count required
    return next;
  },

  /** Build a fully-described `Move`, or `null` if illegal. */
  buildMove(token: Token, dice: DiceValue): Move | null {
    const to = this.destination(token, dice);
    if (to === null) return null;
    const exitsBase = token.state === 'base';
    return {
      tokenId: token.id,
      from: token.position,
      to,
      steps: dice,
      exitsBase,
      reachesHome: to === HOME_POSITION,
    };
  },

  /** Apply a move immutably, returning the updated token collection. */
  applyMove(tokens: readonly Token[], move: Move): Token[] {
    return replaceWhere(
      tokens,
      (t) => t.id === move.tokenId,
      (t) => ({
        ...t,
        state: move.reachesHome ? 'home' : 'active',
        position: move.to,
      }),
    );
  },

  /** Ordered list of intermediate ring/home coordinates for animating a move. */
  stepPositions(move: Move): number[] {
    if (move.exitsBase) return [0];
    const positions: number[] = [];
    for (let p = move.from + 1; p <= move.to; p += 1) positions.push(p);
    return positions;
  },

  // Re-export the helper most callers want alongside movement.
  isFinished: TokenEngine.hasFinished,
} as const;
