import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  Board,
  DiceTray,
  PlayerPanel,
  TurnIndicator,
  WinnerModal,
} from '@/components/game';
import { Screen } from '@/components/ui';
import { useGameController } from '@/hooks';
import { useHasGame, useMatchStore, usePlayers } from '@/store';
import type { RootScreenProps } from '@/navigation';

/**
 * The match screen. It wires the controller's intent handlers to the board and
 * dice, and composes the status panels. It holds no game logic itself.
 */
export function GameScreen({ navigation }: RootScreenProps<'Game'>) {
  const hasGame = useHasGame();
  const players = usePlayers();
  const restart = useMatchStore((s) => s.restart);
  const quit = useMatchStore((s) => s.quit);
  const { rollDice, handleTokenPress } = useGameController();

  // Guard against landing here without a configured match.
  useEffect(() => {
    if (!hasGame) navigation.replace('Home');
  }, [hasGame, navigation]);
  if (!hasGame) return null;

  const goHome = () => {
    quit();
    navigation.replace('Home');
  };

  return (
    <Screen className="px-4">
      {/* Header */}
      <View className="flex-row items-center justify-between py-2">
        <Pressable onPress={goHome} hitSlop={12}>
          <Text className="text-base font-semibold text-slate-500 dark:text-slate-400">
            ✕ Quit
          </Text>
        </Pressable>
        <TurnIndicator />
        <View style={{ width: 48 }} />
      </View>

      {/* Player panels */}
      <View className="flex-row flex-wrap justify-center gap-2 py-2">
        {players.map((p) => (
          <PlayerPanel key={p.color} color={p.color} />
        ))}
      </View>

      {/* Board */}
      <View className="flex-1 items-center justify-center">
        <Board onTokenPress={handleTokenPress} />
      </View>

      {/* Dice tray */}
      <View className="items-center py-4">
        <DiceTray onRoll={rollDice} />
      </View>

      <WinnerModal onPlayAgain={restart} onHome={goHome} />
    </Screen>
  );
}
