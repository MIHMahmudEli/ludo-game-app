import type { Token } from '@/types';
import { SAFE_RING_INDICES } from '@/constants';
import { replaceWhere } from '@/utils';
import { TokenEngine } from './TokenEngine';

/**
 * CaptureEngine — opponent capture rules.
 *
 * A token that lands on a non-safe ring cell occupied by opponents sends those
 * opponents back to their base. Tokens in a home column are never capturable
 * (they are off the shared ring).
 */
export const CaptureEngine = {
  isSafeCell(ringIndex: number): boolean {
    return SAFE_RING_INDICES.includes(ringIndex);
  },

  /**
   * Opponent tokens captured by `mover` after it has been placed.
   * `mover` must already reflect its post-move position.
   */
  capturesFor(tokens: readonly Token[], mover: Token): Token[] {
    const ringIndex = TokenEngine.ringIndex(mover);
    if (ringIndex === null) return []; // in base or home column → no capture
    if (this.isSafeCell(ringIndex)) return [];

    return tokens.filter(
      (t) =>
        t.id !== mover.id &&
        t.color !== mover.color &&
        TokenEngine.ringIndex(t) === ringIndex,
    );
  },

  /** Send the captured tokens back to their base immutably. */
  applyCapture(tokens: readonly Token[], captured: readonly Token[]): Token[] {
    if (captured.length === 0) return [...tokens];
    const capturedIds = new Set(captured.map((t) => t.id));
    return replaceWhere(
      tokens,
      (t) => capturedIds.has(t.id),
      (t) => ({ ...t, state: 'base', position: -1 }),
    );
  },
} as const;
