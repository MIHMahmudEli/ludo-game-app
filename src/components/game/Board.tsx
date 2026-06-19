import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useResponsiveBoard } from '@/hooks';
import { useGameTheme } from '@/theme';
import { BOARD_FRAME } from '@/constants';
import { useTokenIds } from '@/store';
import { BoardBackground } from './BoardBackground';
import { TokenView } from './TokenView';

interface BoardProps {
  onTokenPress: (id: string) => void;
}

/**
 * Board = a glossy wooden frame wrapping the static SVG background + the live,
 * absolutely-positioned tokens. Subscribes only to the (stable) list of token
 * ids, so the container virtually never re-renders; tokens animate on their own.
 */
export function Board({ onTokenPress }: BoardProps) {
  const { boardSize, cell } = useResponsiveBoard();
  const { isDark } = useGameTheme();
  const tokenIds = useTokenIds();
  const frame = isDark ? BOARD_FRAME.dark : BOARD_FRAME.light;
  const pad = cell * 0.5;

  return (
    <LinearGradient
      colors={[frame[0], frame[1]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        padding: pad,
        borderRadius: cell * 0.9,
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 10,
      }}
    >
      <View
        style={{ width: boardSize, height: boardSize }}
        className="rounded-2xl overflow-hidden"
      >
        <BoardBackground boardSize={boardSize} isDark={isDark} />
        {tokenIds.map((id) => (
          <TokenView key={id} tokenId={id} cell={cell} onPress={onTokenPress} />
        ))}
      </View>
    </LinearGradient>
  );
}
