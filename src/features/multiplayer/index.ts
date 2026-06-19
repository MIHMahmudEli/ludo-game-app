import type { DiceValue, GameState, PlayerColor } from '@/types';

/**
 * Online multiplayer contracts (scaffold).
 *
 * No socket code ships yet, but the event shapes are defined now so the client
 * and the future NestJS gateway share one source of truth. Crucially, the
 * server will run the SAME `@/features/ludo-engine` reducers, so these payloads
 * only ever carry intents + authoritative state — never re-implemented rules.
 *
 * Migration path:
 *   1. Add a `socketStore` mirroring `multiplayerStore` with a real client.
 *   2. On `state:sync`, replace the local `GameState` with the server's.
 *   3. Route human intents through `intent:*` instead of the local controller.
 */

/** Messages the client sends to the server. */
export interface ClientToServerEvents {
  'room:join': (roomId: string) => void;
  'room:leave': () => void;
  'intent:roll': () => void;
  'intent:move': (tokenId: string) => void;
}

/** Messages the server pushes to clients. */
export interface ServerToClientEvents {
  'room:assigned': (payload: { roomId: string; color: PlayerColor }) => void;
  'state:sync': (state: GameState) => void;
  'dice:rolled': (value: DiceValue) => void;
  'error': (message: string) => void;
}

export const MULTIPLAYER_READY = false;
