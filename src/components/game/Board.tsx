import { View } from 'react-native';
import { useResponsiveBoard } from '@/hooks';
import { useGameTheme } from '@/theme';
import { useTokenIds } from '@/store';
import { PLAYER_COLORS } from '@/types';
import { BoardBackground } from './BoardBackground';
import { BoardDice } from './BoardDice';
import { HomeGlow } from './HomeGlow';
import { TokenView } from './TokenView';

interface BoardProps {
  onTokenPress: (id: string) => void;
  onRoll: () => void;
}

/**
 * Board = the static SVG background + live, absolutely-positioned pin tokens,
 * inside a thin rounded frame (classic flat look). Subscribes only to the
 * (stable) token-id list, so the container virtually never re-renders.
 */
export function Board({ onTokenPress, onRoll }: BoardProps) {
  const { boardSize, cell } = useResponsiveBoard();
  const { isDark } = useGameTheme();
  const tokenIds = useTokenIds();

  return (
    <View
      style={{
        width: boardSize,
        height: boardSize,
        borderWidth: 3,
        borderColor: isDark ? '#334155' : '#0F172A',
        borderRadius: cell * 0.5,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
        elevation: 8,
      }}
    >
      <BoardBackground boardSize={boardSize} isDark={isDark} />
      <HomeGlow cell={cell} />
      {PLAYER_COLORS.map((color) => (
        <BoardDice key={color} color={color} cell={cell} onRoll={onRoll} />
      ))}
      {tokenIds.map((id) => (
        <TokenView key={id} tokenId={id} cell={cell} onPress={onTokenPress} />
      ))}
    </View>
  );
}
