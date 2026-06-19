import { Pressable, Switch, Text, View } from 'react-native';
import { Card, Screen } from '@/components/ui';
import type { AnimationSpeed, ThemePreference } from '@/types';
import { useSettingsStore } from '@/store';
import type { RootScreenProps } from '@/navigation';

function SegmentedRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View className="flex-row gap-2">
      {options.map((opt) => (
        <Pressable
          key={opt}
          onPress={() => onChange(opt)}
          className={`flex-1 items-center rounded-xl px-3 py-2 ${
            value === opt ? 'bg-brand' : 'bg-slate-200 dark:bg-surface-dark'
          }`}
        >
          <Text
            className={`text-sm font-semibold capitalize ${
              value === opt ? 'text-white' : 'text-slate-700 dark:text-slate-200'
            }`}
          >
            {opt}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const THEMES: readonly ThemePreference[] = ['light', 'dark', 'system'];
const SPEEDS: readonly AnimationSpeed[] = ['slow', 'normal', 'fast'];

/** User preferences. All values persist via the settings store. */
export function SettingsScreen({ navigation }: RootScreenProps<'Settings'>) {
  const {
    theme,
    animationSpeed,
    soundEnabled,
    hapticsEnabled,
    setTheme,
    setAnimationSpeed,
    toggleSound,
    toggleHaptics,
  } = useSettingsStore();

  return (
    <Screen className="px-6">
      <View className="flex-row items-center py-4">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text className="text-2xl text-slate-700 dark:text-slate-200">‹</Text>
        </Pressable>
        <Text className="ml-3 text-2xl font-extrabold text-slate-900 dark:text-white">
          Settings
        </Text>
      </View>

      <Card className="gap-5">
        <View>
          <Text className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            THEME
          </Text>
          <SegmentedRow options={THEMES} value={theme} onChange={setTheme} />
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            ANIMATION SPEED
          </Text>
          <SegmentedRow
            options={SPEEDS}
            value={animationSpeed}
            onChange={setAnimationSpeed}
          />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-base font-medium text-slate-800 dark:text-slate-100">
            Haptics
          </Text>
          <Switch value={hapticsEnabled} onValueChange={toggleHaptics} />
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-base font-medium text-slate-800 dark:text-slate-100">
            Sound
          </Text>
          <Switch value={soundEnabled} onValueChange={toggleSound} />
        </View>
      </Card>
    </Screen>
  );
}
