import type { GameState, PlayerColor, Token } from '@/types';
import { TokenEngine } from './TokenEngine';

/**
 * WinConditionEngine — finishing & game-over rules.
 *
 * Tracks per-colour completion and the overall match outcome. The default rule
 * is "first colour to bring all four tokens home wins"; the finishing order is
 * still recorded so leaderboards/achievements can rank every player later.
 */
export const WinConditionEngine = {
  /** All four of a colour's tokens have reached home. */
  isColorFinished(tokens: readonly Token[], color: PlayerColor): boolean {
    const owned = TokenEngine.byColor(tokens, color);
    return owned.length > 0 && owned.every(TokenEngine.hasFinished);
  },

  /** Colours (in current rotation) that have just completed and aren't ranked. */
  newlyFinishedColors(state: GameState): PlayerColor[] {
    return state.players
      .map((p) => p.color)
      .filter(
        (color) =>
          this.isColorFinished(state.tokens, color) &&
          !state.winners.includes(color),
      );
  },

  /** The match ends as soon as one colour has finished. */
  isGameOver(winners: readonly PlayerColor[]): boolean {
    return winners.length > 0;
  },
} as const;
