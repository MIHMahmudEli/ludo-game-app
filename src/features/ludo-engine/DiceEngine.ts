import type { DiceValue } from '@/types';
import { DICE_EXIT_VALUE } from '@/constants';
import { defaultRng, randomInt, type Rng } from '@/utils';

/**
 * DiceEngine — the single source of dice randomness.
 *
 * Pure and RNG-injectable so matches are reproducible in tests and can be made
 * server-authoritative later (seeded, audited rolls).
 */
export const DiceEngine = {
  roll(rng: Rng = defaultRng): DiceValue {
    return randomInt(1, 6, rng) as DiceValue;
  },

  isSix(value: DiceValue | null): boolean {
    return value === DICE_EXIT_VALUE;
  },
} as const;
