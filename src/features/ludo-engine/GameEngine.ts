import type { DiceValue, GameState, MoveResult, Player } from '@/types';
import { replaceWhere } from '@/utils';
import { TokenEngine } from './TokenEngine';
import { MovementEngine } from './MovementEngine';
import { CaptureEngine } from './CaptureEngine';
import { RuleEngine } from './RuleEngine';
import { TurnEngine } from './TurnEngine';
import { WinConditionEngine } from './WinConditionEngine';

/**
 * GameEngine — the orchestration facade.
 *
 * Every method is a pure reducer `(GameState, input) => GameState`. The engine
 * never touches React, timers, randomness sources or storage — those side
 * effects belong to the application layer (the store/controller hook). This is
 * what lets the *identical* engine run on a NestJS server for authoritative
 * online play.
 */
export const GameEngine = {
  /** Phase guards the UI/controller use to gate intents. */
  canRoll: (s: GameState): boolean => s.phase === 'awaiting-roll',
  canMove: (s: GameState): boolean => s.phase === 'awaiting-move',

  /** Step 1 of a turn: kick off the dice animation. */
  beginRoll(state: GameState): GameState {
    if (!this.canRoll(state)) return state;
    return {
      ...state,
      phase: 'rolling',
      dice: { ...state.dice, isRolling: true, rollId: state.dice.rollId + 1 },
      version: state.version + 1,
    };
  },

  /** Step 2: commit the rolled value and compute what (if anything) is movable. */
  resolveRoll(state: GameState, value: DiceValue): GameState {
    if (state.phase !== 'rolling') return state;

    const turn = RuleEngine.registerRoll(state.turn, value);
    const forfeited = RuleEngine.isThirdSix(turn.consecutiveSixes);
    const movableTokenIds = forfeited
      ? []
      : RuleEngine.movableTokenIds(state.tokens, turn.currentColor, value);

    return {
      ...state,
      turn,
      dice: { ...state.dice, value, isRolling: false },
      movableTokenIds,
      // Nothing to do (penalty or no legal move) → hand the turn over.
      phase: movableTokenIds.length > 0 ? 'awaiting-move' : 'turn-end',
      version: state.version + 1,
    };
  },

  /** Step 3: apply the chosen token's move and resolve its consequences. */
  applyMoveByToken(state: GameState, tokenId: string): GameState {
    if (!this.canMove(state)) return state;
    if (state.dice.value === null) return state;
    if (!state.movableTokenIds.includes(tokenId)) return state;

    const token = TokenEngine.byId(state.tokens, tokenId);
    if (!token) return state;

    const move = MovementEngine.buildMove(token, state.dice.value);
    if (!move) return state;

    // 1. Move the token.
    let tokens = MovementEngine.applyMove(state.tokens, move);
    const mover = TokenEngine.byId(tokens, tokenId)!;

    // 2. Resolve captures.
    const captured = CaptureEngine.capturesFor(tokens, mover);
    tokens = CaptureEngine.applyCapture(tokens, captured);

    // 3. Recompute player activity & finishing order.
    const players: Player[] = state.players.map((p) => ({
      ...p,
      isActive: !WinConditionEngine.isColorFinished(tokens, p.color),
    }));
    const winners = [
      ...state.winners,
      ...WinConditionEngine.newlyFinishedColors({ ...state, tokens, players }),
    ];

    const result: MoveResult = {
      move,
      captured,
      grantsExtraTurn: RuleEngine.grantsExtraTurn({
        diceValue: state.dice.value,
        capturedCount: captured.length,
        reachedHome: move.reachesHome,
        consecutiveSixes: state.turn.consecutiveSixes,
      }),
    };

    const base: GameState = {
      ...state,
      tokens,
      players,
      winners,
      lastMove: result,
      movableTokenIds: [],
      dice: { ...state.dice, value: null },
      version: state.version + 1,
    };

    // 4. Decide the next phase / whose turn it is.
    if (WinConditionEngine.isGameOver(winners)) {
      return { ...base, phase: 'finished' };
    }
    if (result.grantsExtraTurn) {
      // Same player rolls again; consecutive-six counter is preserved.
      return { ...base, phase: 'awaiting-roll' };
    }
    return {
      ...base,
      phase: 'awaiting-roll',
      turn: {
        currentColor: TurnEngine.nextColor(base),
        consecutiveSixes: 0,
        rollCount: 0,
      },
    };
  },

  /** Hand the turn to the next player (used after a no-move/penalty roll). */
  endTurn(state: GameState): GameState {
    if (state.phase === 'finished') return state;
    const nextColor = TurnEngine.nextColor(state);
    return {
      ...state,
      phase: 'awaiting-roll',
      dice: { ...state.dice, value: null },
      movableTokenIds: [],
      turn: { currentColor: nextColor, consecutiveSixes: 0, rollCount: 0 },
      version: state.version + 1,
    };
  },

  /** Convenience used by the AI/auto-select: the lone movable token, if any. */
  soleMovableTokenId(state: GameState): string | null {
    return state.movableTokenIds.length === 1 ? state.movableTokenIds[0]! : null;
  },

  /** Mark a player as having left (future online use). */
  deactivateColor(state: GameState, color: string): GameState {
    return {
      ...state,
      players: replaceWhere(
        state.players,
        (p) => p.color === color,
        (p) => ({ ...p, isActive: false }),
      ),
      version: state.version + 1,
    };
  },
} as const;
