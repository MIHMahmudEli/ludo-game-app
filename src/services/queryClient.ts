import { QueryClient } from '@tanstack/react-query';

/**
 * Shared React Query client.
 *
 * Local play needs no server state today, but wiring this in now means online
 * features (matchmaking, profiles, leaderboards) drop straight into the same
 * caching/invalidation infrastructure.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
