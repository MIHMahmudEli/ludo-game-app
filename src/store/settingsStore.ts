import { create } from 'zustand';
import type {
  AnimationSpeed,
  SettingsState,
  ThemePreference,
} from '@/types';
import { storage, STORAGE_KEYS } from '@/services';

const DEFAULTS: SettingsState = {
  theme: 'system',
  soundEnabled: true,
  hapticsEnabled: true,
  animationSpeed: 'normal',
};

interface SettingsStore extends SettingsState {
  /** Load persisted settings on app boot. */
  hydrate: () => Promise<void>;
  setTheme: (theme: ThemePreference) => void;
  setAnimationSpeed: (speed: AnimationSpeed) => void;
  toggleSound: () => void;
  toggleHaptics: () => void;
}

/** Persist the user-facing slice after every mutation (fire-and-forget). */
function persist(state: SettingsState): void {
  void storage.set(STORAGE_KEYS.settings, state);
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULTS,

  hydrate: async () => {
    const saved = await storage.get<SettingsState>(STORAGE_KEYS.settings);
    if (saved) set({ ...DEFAULTS, ...saved });
  },

  setTheme: (theme) => {
    set({ theme });
    persist(get());
  },
  setAnimationSpeed: (animationSpeed) => {
    set({ animationSpeed });
    persist(get());
  },
  toggleSound: () => {
    set({ soundEnabled: !get().soundEnabled });
    persist(get());
  },
  toggleHaptics: () => {
    set({ hapticsEnabled: !get().hapticsEnabled });
    persist(get());
  },
}));

/** Map the animation-speed preference to a duration multiplier. */
export const ANIMATION_SPEED_FACTOR: Record<AnimationSpeed, number> = {
  slow: 1.5,
  normal: 1,
  fast: 0.6,
};
