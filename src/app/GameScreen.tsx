import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Board, DICE_BOX_SIZE, DiceBox, WinnerModal } from '@/components/game';
import { Screen } from '@/components/ui';
import { useGameController, useResponsiveBoard } from '@/hooks';
import { useHasGame, useMatchStore, usePlayers } from '@/store';
import { PLAYER_COLORS, type PlayerColor } from '@/types';
import type { RootScreenProps } from '@/navigation';

// Push each box fully outside the board with a small gap from the edge.
const GAP = 8;
const OUT = DICE_BOX_SIZE + GAP;

/** Attach each colour's box to its matching board corner. */
const CORNER: Record<PlayerColor, ViewStyle> = {
  red: { top: -OUT, left: 0 },
  green: { top: -OUT, right: 0 },
  blue: { bottom: -OUT, left: 0 },
  yellow: { bottom: -OUT, right: 0 },
};

/**
 * The match screen. Each seated player has a square dice box attached to their
 * board corner; the box glows on their turn — no turn text. Holds no game
 * logic; intents come from the controller.
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
        {/* Board + dice boxes attached to its corners. */}
        <View style={{ width: boardSize, height: boardSize }}>
          <Board onTokenPress={handleTokenPress} />
          {PLAYER_COLORS.filter((c) => seated.has(c)).map((color) => (
            <View key={color} style={{ position: 'absolute', ...CORNER[color] }}>
              <DiceBox color={color} onRoll={rollDice} />
            </View>
          ))}
        </View>
      </View>

      <WinnerModal onPlayAgain={restart} onHome={goHome} />
    </Screen>
  );
}
