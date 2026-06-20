import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Board, WinnerModal } from '@/components/game';
import { Screen } from '@/components/ui';
import { useGameController } from '@/hooks';
import { useHasGame, useMatchStore } from '@/store';
import type { RootScreenProps } from '@/navigation';

/**
 * The match screen. Each seated player rolls from their own dice in the board's
 * corner (their home base), which glows on their turn — no turn text. Holds no
 * game logic; intents come from the controller.
 */
export function GameScreen({ navigation }: RootScreenProps<'Game'>) {
  const hasGame = useHasGame();
  const restart = useMatchStore((s) => s.restart);
  const quit = useMatchStore((s) => s.quit);
  const { rollDice, handleTokenPress } = useGameController();

  useEffect(() => {
    if (!hasGame) navigation.replace('Home');
  }, [hasGame, navigation]);
  if (!hasGame) return null;

  const goHome = () => {
    quit();
    navigation.replace('Home');
  };

  return (
    <Screen className="px-3">
      <View className="flex-row items-center justify-between py-1">
        <Pressable onPress={goHome} hitSlop={12}>
          <Text className="text-base font-semibold text-slate-500 dark:text-slate-400">
            ✕ Quit
          </Text>
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center">
        <Board onTokenPress={handleTokenPress} onRoll={rollDice} />
      </View>

      <WinnerModal onPlayAgain={restart} onHome={goHome} />
    </Screen>
  );
}
