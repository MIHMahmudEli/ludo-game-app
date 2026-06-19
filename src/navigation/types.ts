import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Strongly-typed route map. New destinations (Leaderboard, Achievements, online
 * lobby…) get added here and become type-safe across the whole app.
 */
export type RootStackParamList = {
  Home: undefined;
  GameSetup: undefined;
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
