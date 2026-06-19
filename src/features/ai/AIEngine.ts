import type { GameState, Move, Token } from '@/types';
import { HOME_POSITION } from '@/constants';
import {
  CaptureEngine,
  MovementEngine,
  TokenEngine,
} from '@/features/ludo-engine';

/**
 * AIEngine — opponent decision making.
 *
 * Pure heuristic policy: given a state awaiting a move, score every legal move
 * and return the best token to play. Kept separate from the rule engine so the
 * difficulty/strategy can evolve (or be swapped for a search/ML policy) without
 * touching the rules. Returns `null` when there is nothing to move.
 */
export const AIEngine = {
  chooseTokenId(state: GameState): string | null {
    if (state.movableTokenIds.length === 0) return null;

    let bestId: string | null = null;
    let bestScore = -Infinity;

    for (const tokenId of state.movableTokenIds) {
      const token = TokenEngine.byId(state.tokens, tokenId);
      if (!token || state.dice.value === null) continue;
      const move = MovementEngine.buildMove(token, state.dice.value);
      if (!move) continue;

      const score = this.scoreMove(state, token, move);
      if (score > bestScore) {
        bestScore = score;
        bestId = tokenId;
      }
    }
    return bestId;
  },

  /** Higher is better. Capturing and finishing dominate; progress breaks ties. */
  scoreMove(state: GameState, token: Token, move: Move): number {
    let score = 0;

    // Simulate the landing to evaluate captures.
    const movedTokens = MovementEngine.applyMove(state.tokens, move);
    const mover = TokenEngine.byId(movedTokens, token.id)!;
    const captured = CaptureEngine.capturesFor(movedTokens, mover);

    if (captured.length > 0) {
      // Reward by how far the victims had advanced (more painful = better).
      score += 100 + captured.reduce((sum, c) => sum + Math.max(c.position, 0), 0);
    }
    if (move.reachesHome) score += 80;
    if (move.exitsBase) score += 40; // getting tokens into play is valuable
    if (CaptureEngine['isSafeCell'](TokenEngine.ringIndex(mover) ?? -1)) score += 15;

    // Avoid leaving a token one short of home doing nothing; nudge progress.
    score += (move.to / HOME_POSITION) * 10;
    return score;
  },
} as const;
