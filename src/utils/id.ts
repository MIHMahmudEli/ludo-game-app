import type { PlayerColor } from '@/types';

/** Stable token id, e.g. `red-2`. */
export function tokenId(color: PlayerColor, index: number): string {
  return `${color}-${index}`;
}

/** Parse a token id back into its parts. */
export function parseTokenId(id: string): { color: PlayerColor; index: number } {
  const [color, index] = id.split('-') as [PlayerColor, string];
  return { color, index: Number(index) };
}
