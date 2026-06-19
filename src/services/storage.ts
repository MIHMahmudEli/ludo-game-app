import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Thin, typed persistence wrapper around AsyncStorage.
 *
 * Centralising storage access keeps key names in one place and gives us a
 * single seam to swap the backend (e.g. MMKV or a remote profile) later.
 */
export const STORAGE_KEYS = {
  settings: 'ludo:settings',
  savedGame: 'ludo:saved-game',
  stats: 'ludo:stats',
} as const;

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Non-fatal: persistence is best-effort.
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};
