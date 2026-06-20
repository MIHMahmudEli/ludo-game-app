import { useShallow } from 'zustand/react/shallow';
import type { PlayerColor, Token } from '@/types';
import { coordForPosition } from '@/constants';
import { TurnEngine } from '@/features/ludo-engine';
import { useMatchStore } from './matchStore';

/** Grid-cell key for an on-board token (base tokens have their own slots). */
function cellKey(t: Token): string {
  const [r, c] = coordForPosition(t.color, t.position);
  return `${r}:${c}`;
}

/**
 * Selector hooks — the read API of the match store.
 *
 * These give the rest of the app the "separate stores" ergonomics (players,
 * tokens, dice, turn…) while the underlying state stays atomic. Each hook
 * subscribes to the narrowest possible slice so components re-render only when
 * their own data changes. Because the engine reuses object identity for
 * untouched tokens, `useToken(id)` re-renders only when *that* token moves.
 */

export const useGame = () => useMatchStore((s) => s.game);
export const useHasGame = () => useMatchStore((s) => s.game !== null);
export const usePhase = () => useMatchStore((s) => s.game?.phase ?? null);
export const useInputLocked = () => useMatchStore((s) => s.inputLocked);

export const usePlayers = () =>
  useMatchStore(useShallow((s) => s.game?.players ?? []));

export const useTokenIds = () =>
  useMatchStore(useShallow((s) => s.game?.tokens.map((t) => t.id) ?? []));

export const useToken = (id: string) =>
  useMatchStore((s) => s.game?.tokens.find((t) => t.id === id));

export const useTokensByColor = (color: PlayerColor) =>
  useMatchStore(useShallow((s) => s.game?.tokens.filter((t) => t.color === color) ?? []));

export const useDice = () =>
  useMatchStore(
    useShallow((s) => s.game?.dice ?? { value: null, isRolling: false, rollId: 0 }),
  );

export const useTurn = () => useMatchStore((s) => s.game?.turn ?? null);

export const useMovableTokenIds = () =>
  useMatchStore(useShallow((s) => s.game?.movableTokenIds ?? []));

export const useIsTokenMovable = (id: string) =>
  useMatchStore((s) => s.game?.movableTokenIds.includes(id) ?? false);

/**
 * This token's place within the cluster of tokens sharing its cell, so the UI
 * can fan out overlapping pins. Base tokens (own yard slots) never cluster.
 */
export const useTokenCluster = (id: string) =>
  useMatchStore(
    useShallow((s) => {
      const me = s.game?.tokens.find((t) => t.id === id);
      if (!me || me.state === 'base') return { index: 0, count: 1 };
      const key = cellKey(me);
      const group = s.game!.tokens
        .filter((t) => t.state !== 'base' && cellKey(t) === key)
        .map((t) => t.id)
        .sort();
      return { index: group.indexOf(id), count: group.length };
    }),
  );

export const useWinners = () =>
  useMatchStore(useShallow((s) => s.game?.winners ?? []));

export const useLastMove = () => useMatchStore((s) => s.game?.lastMove ?? null);

/** The full player object for the colour currently on turn. */
export const useCurrentPlayer = () =>
  useMatchStore((s) => {
    if (!s.game) return null;
    return TurnEngine.playerByColor(s.game.players, s.game.turn.currentColor) ?? null;
  });
