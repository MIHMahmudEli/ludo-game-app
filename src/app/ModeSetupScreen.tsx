import { Pressable, Text, View } from 'react-native';
import { Button, Card, Screen } from '@/components/ui';
import { PLAYER_HEX } from '@/constants';
import { PLAYER_COLORS, type GameConfig } from '@/types';
import { useMatchStore } from '@/store';
import type { RootScreenProps } from '@/navigation';
import { useState } from 'react';

/** Offline player-count chooser, shared by "Computer" and "Pass & Play". */
export function ModeSetupScreen({ navigation, route }: RootScreenProps<'ModeSetup'>) {
  const { mode } = route.params;
  const isAI = mode === 'vs-ai';
  const [count, setCount] = useState<2 | 3 | 4>(4);
  const newGame = useMatchStore((s) => s.newGame);

  const colors = PLAYER_COLORS.slice(0, count);

  const start = () => {
    const config: GameConfig = {
      mode,
      colors: [...colors],
      // vs-AI: first seat is the human, the rest are AI.
      aiColors: isAI ? [...colors.slice(1)] : [],
      names: isAI
        ? { [colors[0]!]: 'You' }
        : Object.fromEntries(colors.map((c, i) => [c, `Player ${i + 1}`])),
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
          {isAI ? 'Play vs Computer' : 'Pass & Play'}
        </Text>
      </View>

      <Card className="gap-5">
        <View>
          <Text className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">
            NUMBER OF PLAYERS
          </Text>
          <View className="flex-row gap-3">
            {([2, 3, 4] as const).map((n) => (
              <Pressable
                key={n}
                onPress={() => setCount(n)}
                className={`flex-1 items-center rounded-2xl py-5 ${
                  count === n ? 'bg-brand' : 'bg-slate-200 dark:bg-surface-dark'
                }`}
              >
                <Text
                  className={`text-2xl font-extrabold ${
                    count === n ? 'text-white' : 'text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {n}
                </Text>
              </Pressable>
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
                <Text className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {isAI ? (i === 0 ? 'You' : 'Computer') : `Player ${i + 1}`}
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
