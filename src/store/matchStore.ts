import { create } from 'zustand';
import type { DiceValue, GameConfig, GameState } from '@/types';
import { GameEngine, createGame } from '@/features/ludo-engine';

/**
 * The single authoritative store for a live match.
 *
 * It holds the engine's `GameState` plus one piece of UI-only state
 * (`inputLocked`, used to gate taps during animations). Every action is a thin
 * delegation to a pure `GameEngine` reducer — no rules live here. Splitting the
 * live game across multiple stores would risk torn/desynced renders during the
 * atomic updates a capture performs, so it is deliberately one store; the
 * separation the rest of the app sees comes from the selector hooks.
 */
interface MatchStore {
  game: GameState | null;
  /** The config that started the current match (for "Play Again"). */
  config: GameConfig | null;
  /** True while an animation is playing; blocks further input. */
  inputLocked: boolean;

  newGame: (config: GameConfig) => void;
  restart: () => void;
  beginRoll: () => void;
  resolveRoll: (value: DiceValue) => void;
  selectToken: (tokenId: string) => void;
  endTurn: () => void;
  setInputLocked: (locked: boolean) => void;
  quit: () => void;
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  game: null,
  config: null,
  inputLocked: false,

  newGame: (config) =>
    set({ game: createGame(config), config, inputLocked: false }),

  restart: () => {
    const { config } = get();
    if (config) set({ game: createGame(config), inputLocked: false });
  },

  beginRoll: () => {
    const { game } = get();
    if (game) set({ game: GameEngine.beginRoll(game) });
  },

  resolveRoll: (value) => {
    const { game } = get();
    if (game) set({ game: GameEngine.resolveRoll(game, value) });
  },

  selectToken: (tokenId) => {
    const { game } = get();
    if (game) set({ game: GameEngine.applyMoveByToken(game, tokenId) });
  },

  endTurn: () => {
    const { game } = get();
    if (game) set({ game: GameEngine.endTurn(game) });
  },

  setInputLocked: (inputLocked) => set({ inputLocked }),

  quit: () => set({ game: null, inputLocked: false }),
}));
