import { create } from 'zustand';
import type { ConnectionStatus } from '@/types';

/**
 * Multiplayer store — intentionally a thin stub today.
 *
 * It establishes the shape the online layer will fill in (socket status, room,
 * latency) so screens can already read these fields. When the NestJS + Socket
 * backend lands, only the actions here change; the rest of the app keeps using
 * the same selectors. Real-time moves will be applied through the very same
 * `GameEngine` reducers the local game uses, keeping client/server in lockstep.
 */
interface MultiplayerStore {
  status: ConnectionStatus;
  roomId: string | null;
  selfColor: string | null;
  latencyMs: number | null;

  setStatus: (status: ConnectionStatus) => void;
  setRoom: (roomId: string | null) => void;
  reset: () => void;
}

export const useMultiplayerStore = create<MultiplayerStore>((set) => ({
  status: 'disconnected',
  roomId: null,
  selfColor: null,
  latencyMs: null,

  setStatus: (status) => set({ status }),
  setRoom: (roomId) => set({ roomId }),
  reset: () =>
    set({ status: 'disconnected', roomId: null, selfColor: null, latencyMs: null }),
}));
