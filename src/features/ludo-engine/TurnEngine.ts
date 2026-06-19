import type { GameState, Player, PlayerColor } from '@/types';

/**
 * TurnEngine — whose turn is it next.
 *
 * Pure rotation logic that skips players who have finished/left, so it already
 * supports 2-4 players and future drop-outs without special-casing.
 */
export const TurnEngine = {
  playerByColor(players: readonly Player[], color: PlayerColor): Player | undefined {
    return players.find((p) => p.color === color);
  },

  /** Next still-active colour after the current one, in seat order. */
  nextColor(state: GameState): PlayerColor {
    const ordered = [...state.players].sort((a, b) => a.order - b.order);
    const currentIdx = ordered.findIndex(
      (p) => p.color === state.turn.currentColor,
    );
    for (let step = 1; step <= ordered.length; step += 1) {
      const candidate = ordered[(currentIdx + step) % ordered.length]!;
      if (candidate.isActive) return candidate.color;
    }
    // Everyone else has finished — keep the current colour.
    return state.turn.currentColor;
  },
} as const;
