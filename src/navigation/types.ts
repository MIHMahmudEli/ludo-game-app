import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { GameMode } from '@/types';

/**
 * Strongly-typed route map. New destinations (Leaderboard, Achievements…) get
 * added here and become type-safe across the whole app.
 */
export type RootStackParamList = {
  Home: undefined;
  /** Offline player-count chooser, shared by "Computer" and "Pass & Play". */
  ModeSetup: { mode: GameMode };
  /** Online lobby: create or join a room by 4-digit code. */
  Online: undefined;
  Game: undefined;
  Settings: undefined;
};

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
