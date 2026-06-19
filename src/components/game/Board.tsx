import { View } from 'react-native';
import { useResponsiveBoard } from '@/hooks';
import { useGameTheme } from '@/theme';
import { useTokenIds } from '@/store';
import { BoardBackground } from './BoardBackground';
import { TokenView } from './TokenView';

interface BoardProps {
  onTokenPress: (id: string) => void;
}

/**
 * Board = static SVG background + the live, absolutely-positioned tokens.
 * Subscribes only to the (stable) list of token ids, so the board container
 * itself virtually never re-renders; tokens animate independently.
 */
export function Board({ onTokenPress }: BoardProps) {
  const { boardSize, cell } = useResponsiveBoard();
  const { isDark } = useGameTheme();
  const tokenIds = useTokenIds();

  return (
    <View
      style={{ width: boardSize, height: boardSize }}
      className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700"
    >
      <BoardBackground boardSize={boardSize} isDark={isDark} />
      {tokenIds.map((id) => (
        <TokenView key={id} tokenId={id} cell={cell} onPress={onTokenPress} />
      ))}
    </View>
  );
}
