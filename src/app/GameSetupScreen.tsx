import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button, Card, Screen } from '@/components/ui';
import { PLAYER_HEX } from '@/constants';
import { PLAYER_COLORS, type GameConfig, type GameMode } from '@/types';
import { useMatchStore } from '@/store';
import type { RootScreenProps } from '@/navigation';

interface OptionProps<T> {
  label: string;
  value: T;
  selected: boolean;
  onSelect: (v: T) => void;
}
function Option<T>({ label, value, selected, onSelect }: OptionProps<T>) {
  return (
    <Pressable
      onPress={() => onSelect(value)}
      className={`flex-1 items-center rounded-xl px-4 py-3 ${
        selected
          ? 'bg-brand'
          : 'bg-slate-200 dark:bg-surface-dark-elevated'
      }`}
    >
      <Text
        className={`font-semibold ${
          selected ? 'text-white' : 'text-slate-700 dark:text-slate-200'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Configure mode and player count, then start a match. */
export function GameSetupScreen({ navigation }: RootScreenProps<'GameSetup'>) {
  const [mode, setMode] = useState<GameMode>('vs-ai');
  const [count, setCount] = useState<2 | 3 | 4>(4);
  const newGame = useMatchStore((s) => s.newGame);

  const colors = PLAYER_COLORS.slice(0, count);

  const start = () => {
    // In vs-AI mode the first seat is the human; the rest are AI.
    const aiColors = mode === 'vs-ai' ? colors.slice(1) : [];
    const config: GameConfig = {
      mode,
      colors: [...colors],
      aiColors: [...aiColors],
      names: {},
    };
    newGame(config);
    navigation.navigate('Game');
  };

  return (
    <Screen className="px-6">
      <View className="flex-row items-center py-4">
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text className="text-2xl text-slate-700 dark:text-slate-200">‹</Text>
        </Pressable>
        <Text className="ml-3 text-2xl font-extrabold text-slate-900 dark:text-white">
          New Game
        </Text>
      </View>

      <Card className="mt-2 gap-4">
        <View>
          <Text className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            MODE
          </Text>
          <View className="flex-row gap-3">
            <Option label="Vs AI" value="vs-ai" selected={mode === 'vs-ai'} onSelect={setMode} />
            <Option
              label="Pass & Play"
              value="local-multiplayer"
              selected={mode === 'local-multiplayer'}
              onSelect={setMode}
            />
          </View>
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            PLAYERS
          </Text>
          <View className="flex-row gap-3">
            {([2, 3, 4] as const).map((n) => (
              <Option key={n} label={`${n}`} value={n} selected={count === n} onSelect={setCount} />
            ))}
          </View>
        </View>

        <View>
          <Text className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            SEATS
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {colors.map((c, i) => (
              <View
                key={c}
                className="flex-row items-center gap-2 rounded-xl bg-slate-100 dark:bg-surface-dark px-3 py-2"
              >
                <View
                  style={{ backgroundColor: PLAYER_HEX[c] }}
                  className="h-4 w-4 rounded-full"
                />
                <Text className="text-sm font-medium capitalize text-slate-700 dark:text-slate-200">
                  {c}
                </Text>
                <Text className="text-xs text-slate-400">
                  {mode === 'vs-ai' && i > 0 ? 'AI' : 'Human'}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Card>

      <View className="mt-auto pb-4">
        <Button label="Start Game" size="lg" onPress={start} />
      </View>
    </Screen>
  );
}
