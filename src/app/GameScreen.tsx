import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Board, DICE_BOX_SIZE, DiceBox, WinnerModal } from '@/components/game';
import { Screen } from '@/components/ui';
import { useGameController } from '@/hooks';
import { useHasGame, useMatchStore, usePlayers } from '@/store';
import type { PlayerColor } from '@/types';
import type { RootScreenProps } from '@/navigation';

/** Box placement matched to each colour's board quadrant. */
const ROWS: PlayerColor[][] = [
  ['red', 'green'], // top: left, right
  ['blue', 'yellow'], // bottom: left, right
];

/**
 * The match screen. Each seated player has a square dice box in their corner
 * (around the board) that glows on their turn — no turn text. Holds no game
 * logic; intents come from the controller.
 */
export function GameScreen({ navigation }: RootScreenProps<'Game'>) {
  const hasGame = useHasGame();
  const players = usePlayers();
  const restart = useMatchStore((s) => s.restart);
  const quit = useMatchStore((s) => s.quit);
  const { rollDice, handleTokenPress } = useGameController();

  useEffect(() => {
    if (!hasGame) navigation.replace('Home');
  }, [hasGame, navigation]);
  if (!hasGame) return null;

  const seated = new Set(players.map((p) => p.color));
  const goHome = () => {
    quit();
    navigation.replace('Home');
  };

  const renderRow = (row: PlayerColor[]) => (
    <View className="flex-row items-center justify-between px-4">
      {row.map((color) =>
        seated.has(color) ? (
          <DiceBox key={color} color={color} onRoll={rollDice} />
        ) : (
          <View key={color} style={{ width: DICE_BOX_SIZE }} />
        ),
      )}
    </View>
  );

  return (
    <Screen className="px-3">
      <View className="flex-row items-center justify-between py-1">
        <Pressable onPress={goHome} hitSlop={12}>
          <Text className="text-base font-semibold text-slate-500 dark:text-slate-400">
            ✕ Quit
          </Text>
        </Pressable>
      </View>

      {renderRow(ROWS[0]!)}

      <View className="flex-1 items-center justify-center">
        <Board onTokenPress={handleTokenPress} />
      </View>

      {renderRow(ROWS[1]!)}

      <WinnerModal onPlayAgain={restart} onHome={goHome} />
    </Screen>
  );
}
