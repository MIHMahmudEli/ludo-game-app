import type { DiceValue, GameState, Move, Token, TurnState } from '@/types';
import { DICE_EXIT_VALUE, MAX_CONSECUTIVE_SIXES } from '@/constants';
import { TokenEngine } from './TokenEngine';
import { MovementEngine } from './MovementEngine';

/**
 * RuleEngine — higher-order Ludo rules that compose the lower engines.
 *
 * Determines which moves are legal for the player on turn and how a roll/move
 * affects turn continuation (extra turns, the three-sixes penalty).
 */
export const RuleEngine = {
  /** All legal moves for `color` given the current dice `value`. */
  legalMoves(tokens: readonly Token[], color: string, value: DiceValue): Move[] {
    return tokens
      .filter((t) => t.color === color)
      .map((t) => MovementEngine.buildMove(t, value))
      .filter((m): m is Move => m !== null);
  },

  movableTokenIds(tokens: readonly Token[], color: string, value: DiceValue): string[] {
    return this.legalMoves(tokens, color, value).map((m) => m.tokenId);
  },

  /** Rolling a third consecutive six forfeits the turn. */
  isThirdSix(consecutiveSixes: number): boolean {
    return consecutiveSixes >= MAX_CONSECUTIVE_SIXES;
  },

  /**
   * A player rolls again when they roll a six, capture an opponent, or send a
   * token home — unless the three-sixes penalty has been triggered.
   */
  grantsExtraTurn(params: {
    diceValue: DiceValue;
    capturedCount: number;
    reachedHome: boolean;
    consecutiveSixes: number;
  }): boolean {
    if (this.isThirdSix(params.consecutiveSixes)) return false;
    return (
      params.diceValue === DICE_EXIT_VALUE ||
      params.capturedCount > 0 ||
      params.reachedHome
    );
  },

  /** Update the running six counter for a freshly rolled value. */
  registerRoll(turn: TurnState, value: DiceValue): TurnState {
    return {
      ...turn,
      rollCount: turn.rollCount + 1,
      consecutiveSixes: value === DICE_EXIT_VALUE ? turn.consecutiveSixes + 1 : 0,
    };
  },

  /** Convenience: does the player on turn have any legal move at all? */
  hasAnyMove(state: GameState): boolean {
    if (state.dice.value === null) return false;
    return (
      this.movableTokenIds(state.tokens, state.turn.currentColor, state.dice.value)
        .length > 0
    );
  },

  /** Re-exported so callers can reason about safe squares via the RuleEngine. */
  isInBase: TokenEngine.isInBase,
} as const;
