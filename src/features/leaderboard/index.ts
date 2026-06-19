import type { PlayerColor } from '@/types';

/**
 * Leaderboard feature (scaffold).
 *
 * Defines the data shape the UI and a future `/leaderboard` API will exchange.
 * With React Query already wired, fetching becomes a single `useQuery` hook
 * here without touching the rest of the app.
 */
export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  displayName: string;
  wins: number;
  gamesPlayed: number;
  tokensCaptured: number;
}

export interface MatchResult {
  winner: PlayerColor;
  /** Finishing order, best first. */
  placements: PlayerColor[];
  durationMs: number;
  finishedAt: number;
}
