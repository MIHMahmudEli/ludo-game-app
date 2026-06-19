import type { MoveResult } from '@/types';

/**
 * Achievements feature (scaffold).
 *
 * Achievements are pure predicates over match events/results, mirroring the
 * engine's pure-function philosophy so they can be evaluated identically on
 * device or server.
 */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: readonly Achievement[] = [
  { id: 'first-win', title: 'First Victory', description: 'Win your first match', icon: '🏆' },
  { id: 'triple-six', title: 'Hot Hand', description: 'Roll three sixes in a row', icon: '🎲' },
  { id: 'hunter', title: 'Hunter', description: 'Capture 3 tokens in one match', icon: '🎯' },
  { id: 'flawless', title: 'Flawless', description: 'Win without losing a token', icon: '✨' },
];

/** Example evaluator hook point: true if a move captured an opponent. */
export function isCapture(result: MoveResult | null): boolean {
  return (result?.captured.length ?? 0) > 0;
}
