/**
 * Random source abstraction.
 *
 * Injecting an `Rng` keeps the engine deterministic in tests and lets a future
 * server use a seeded/audited generator for fair, reproducible matches.
 */
export type Rng = () => number;

export const defaultRng: Rng = Math.random;

/** Inclusive integer in `[min, max]`. */
export function randomInt(min: number, max: number, rng: Rng = defaultRng): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/** Deterministic mulberry32 PRNG — handy for replays and tests. */
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
