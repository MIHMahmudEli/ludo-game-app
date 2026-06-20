import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Board, PlayerCorner, WinnerModal } from '@/components/game';
import { Screen } from '@/components/ui';
import { useGameController } from '@/hooks';
import { useHasGame, useMatchStore, usePlayers } from '@/store';
import type { PlayerColor } from '@/types';
import type { RootScreenProps } from '@/navigation';

/** Corner placement matched to each colour's board quadrant. */
const CORNERS: PlayerColor[][] = [
  ['red', 'green'], // top row: TL, TR
  ['blue', 'yellow'], // bottom row: BL, BR
];

/**
 * The match screen. Each seated player gets a dedicated dice corner that glows
 * on their turn; there is no turn text. Holds no game logic — intents come from
 * the controller.
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
    <View className="flex-row items-start justify-between px-1">
      {row.map((color) =>
        seated.has(color) ? (
          <PlayerCorner key={color} color={color} onRoll={rollDice} />
        ) : (
          <View key={color} style={{ width: 110 }} />
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

      {renderRow(CORNERS[0]!)}

      <View className="flex-1 items-center justify-center">
        <Board onTokenPress={handleTokenPress} />
      </View>

      {renderRow(CORNERS[1]!)}

      <WinnerModal onPlayAgain={restart} onHome={goHome} />
    </Screen>
  );
}
