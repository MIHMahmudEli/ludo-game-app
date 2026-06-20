import { create } from 'zustand';
import type { ConnectionStatus } from '@/types';

export type PlayerCount = 2 | 3 | 4;

/** Generate a 4-digit room code (1000–9999). */
function generateRoomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

/**
 * Multiplayer / room store.
 *
 * Owns the online lobby state — room code, host flag, seat count. Today it runs
 * client-side (codes are generated locally); when the NestJS + Socket backend
 * lands, `createRoom`/`joinRoom` become network calls and `status` reflects the
 * real socket, while the rest of the app keeps using these same selectors. The
 * live game itself will still be driven by the shared `GameEngine` reducers.
 */
interface MultiplayerStore {
  status: ConnectionStatus;
  roomCode: string | null;
  isHost: boolean;
  playerCount: PlayerCount;
  selfColor: string | null;

  setPlayerCount: (count: PlayerCount) => void;
  createRoom: (count: PlayerCount) => string;
  joinRoom: (code: string) => void;
  leaveRoom: () => void;
}

export const useMultiplayerStore = create<MultiplayerStore>((set) => ({
  status: 'disconnected',
  roomCode: null,
  isHost: false,
  playerCount: 4,
  selfColor: null,

  setPlayerCount: (playerCount) => set({ playerCount }),

  createRoom: (count) => {
    const code = generateRoomCode();
    set({
      roomCode: code,
      isHost: true,
      playerCount: count,
      status: 'in-room',
      selfColor: 'red',
    });
    return code;
  },

  joinRoom: (code) => {
    set({ roomCode: code, isHost: false, status: 'connecting' });
  },

  leaveRoom: () =>
    set({
      status: 'disconnected',
      roomCode: null,
      isHost: false,
      selfColor: null,
    }),
}));
