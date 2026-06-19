import { Text, View } from 'react-native';
import { PLAYER_HEX } from '@/constants';
import { useCurrentPlayer, useDice, usePhase } from '@/store';

/** Headline showing whose turn it is and what the game expects next. */
export function TurnIndicator() {
  const player = useCurrentPlayer();
  const phase = usePhase();
  const dice = useDice();

  if (!player) return null;

  return (
    <View className="flex-row items-center justify-center gap-2">
      <View
        style={{ backgroundColor: PLAYER_HEX[player.color] }}
        className="h-3 w-3 rounded-full"
      />
      <Text className="text-base font-bold text-slate-800 dark:text-slate-100">
        {player.name}'s turn
      </Text>
      {dice.value !== null && phase !== 'rolling' && (
        <Text className="text-base font-bold text-slate-400">· rolled {dice.value}</Text>
      )}
    </View>
  );
}
