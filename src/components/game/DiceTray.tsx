import { Text, View } from 'react-native';
import {
  useCurrentPlayer,
  useDice,
  useInputLocked,
  usePhase,
} from '@/store';
import { Dice } from './Dice';

interface DiceTrayProps {
  onRoll: () => void;
}

/** Dice + contextual hint. Reads game state via selectors; behaviour via prop. */
export function DiceTray({ onRoll }: DiceTrayProps) {
  const dice = useDice();
  const player = useCurrentPlayer();
  const phase = usePhase();
  const locked = useInputLocked();

  if (!player) return null;
  const isAI = player.type === 'ai';
  const canRoll = phase === 'awaiting-roll' && !locked && !isAI;

  const hint = (() => {
    if (isAI) return `${player.name} is thinking…`;
    switch (phase) {
      case 'awaiting-roll':
        return 'Tap the dice to roll';
      case 'rolling':
        return 'Rolling…';
      case 'awaiting-move':
        return 'Tap a highlighted token';
      case 'turn-end':
        return 'No moves available';
      default:
        return '';
    }
  })();

  return (
    <View className="items-center gap-2">
      {/* Felt tray the die "drops" onto. */}
      <View
        className="items-center justify-center rounded-3xl bg-emerald-700/15 dark:bg-emerald-400/10 p-3"
        style={{
          shadowColor: '#000',
          shadowOpacity: 0.12,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Dice
          value={dice.value}
          isRolling={dice.isRolling}
          color={player.color}
          disabled={!canRoll}
          onPress={onRoll}
        />
      </View>
      <Text className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {hint}
      </Text>
    </View>
  );
}
