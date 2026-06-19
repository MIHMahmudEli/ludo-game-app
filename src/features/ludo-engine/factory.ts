import type { GameConfig, GameState, Player } from '@/types';
import { TokenEngine } from './TokenEngine';

const DEFAULT_NAMES: Record<string, string> = {
  red: 'Red',
  green: 'Green',
  yellow: 'Yellow',
  blue: 'Blue',
};

/**
 * Build a fresh, ready-to-play `GameState` from a `GameConfig`.
 * Pure: the same config always produces the same starting state.
 */
export function createGame(config: GameConfig): GameState {
  const players: Player[] = config.colors.map((color, order) => ({
    id: color,
    color,
    name: config.names[color] ?? DEFAULT_NAMES[color] ?? color,
    type:
      config.mode === 'vs-ai' && config.aiColors.includes(color)
        ? 'ai'
        : 'human',
    order,
    isActive: true,
  }));

  const tokens = config.colors.flatMap((color) => TokenEngine.createTokens(color));

  return {
    mode: config.mode,
    phase: 'awaiting-roll',
    players,
    tokens,
    dice: { value: null, isRolling: false, rollId: 0 },
    turn: {
      currentColor: config.colors[0]!,
      consecutiveSixes: 0,
      rollCount: 0,
    },
    winners: [],
    movableTokenIds: [],
    lastMove: null,
    version: 0,
  };
}
