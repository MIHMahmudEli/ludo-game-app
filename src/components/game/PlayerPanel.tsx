import { Text, View } from 'react-native';
import type { PlayerColor } from '@/types';
import { PLAYER_HEX } from '@/constants';
import { TokenEngine } from '@/features/ludo-engine';
import { usePlayers, useTokensByColor, useTurn } from '@/store';

interface PlayerPanelProps {
  color: PlayerColor;
  compact?: boolean;
}

/**
 * Compact per-player status: name, home progress and an active-turn highlight.
 * Subscribes only to its own colour's tokens.
 */
export function PlayerPanel({ color, compact }: PlayerPanelProps) {
  const tokens = useTokensByColor(color);
  const players = usePlayers();
  const turn = useTurn();

  const player = players.find((p) => p.color === color);
  if (!player) return null;

  const homeCount = tokens.filter(TokenEngine.hasFinished).length;
  const isActive = turn?.currentColor === color;

  return (
    <View
      className={`flex-row items-center gap-2 rounded-xl px-3 py-2 ${
        isActive
          ? 'bg-white dark:bg-surface-dark-elevated'
          : 'bg-transparent opacity-70'
      }`}
      style={
        isActive
          ? { borderWidth: 2, borderColor: PLAYER_HEX[color] }
          : { borderWidth: 2, borderColor: 'transparent' }
      }
    >
      <View
        style={{ backgroundColor: PLAYER_HEX[color] }}
        className="h-6 w-6 rounded-full"
      />
      {!compact && (
        <Text className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          {player.name}
        </Text>
      )}
      <Text className="text-xs font-bold text-slate-500 dark:text-slate-400">
        {homeCount}/4
      </Text>
    </View>
  );
}
