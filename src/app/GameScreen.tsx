import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Board, DICE_BOX_SIZE, DiceBox, WinnerModal } from '@/components/game';
import { Screen } from '@/components/ui';
import { useGameController, useResponsiveBoard } from '@/hooks';
import { useHasGame, useMatchStore, usePlayers } from '@/store';
import type { PlayerColor } from '@/types';
import type { RootScreenProps } from '@/navigation';

/** Box rows above/below the board, aligned to its left/right corners. */
const ROWS: PlayerColor[][] = [
  ['red', 'green'], // top: left, right
  ['blue', 'yellow'], // bottom: left, right
];

/**
 * The match screen. Each seated player has a square dice box at their board
 * corner; the box glows on their turn — no turn text. The board and its dice
 * boxes share one column sized to the board, so the boxes always align to the
 * board edges and stay fully visible. Holds no game logic.
 */
export function GameScreen({ navigation }: RootScreenProps<'Game'>) {
  const hasGame = useHasGame();
  const players = usePlayers();
  const { boardSize } = useResponsiveBoard();
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
    <View
      style={{ width: boardSize }}
      className="flex-row items-center justify-between"
    >
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

      <View className="flex-1 items-center justify-center">
        <View style={{ width: boardSize }} className="items-center gap-2">
          {renderRow(ROWS[0]!)}
          <Board onTokenPress={handleTokenPress} />
          {renderRow(ROWS[1]!)}
        </View>
      </View>

      <WinnerModal onPlayAgain={restart} onHome={goHome} />
    </Screen>
  );
}
