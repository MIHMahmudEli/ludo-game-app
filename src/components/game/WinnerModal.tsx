import { Modal, Text, View } from 'react-native';
import { PLAYER_HEX } from '@/constants';
import { Button } from '@/components/ui';
import { usePhase, usePlayers, useWinners } from '@/store';

interface WinnerModalProps {
  onPlayAgain: () => void;
  onHome: () => void;
}

/** Celebratory end-of-match overlay. Shown purely off the `finished` phase. */
export function WinnerModal({ onPlayAgain, onHome }: WinnerModalProps) {
  const phase = usePhase();
  const winners = useWinners();
  const players = usePlayers();

  const visible = phase === 'finished';
  const winnerColor = winners[0];
  const winner = players.find((p) => p.color === winnerColor);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/60 px-8">
        <View className="w-full max-w-sm items-center rounded-3xl bg-surface dark:bg-surface-dark-elevated p-6">
          <Text className="text-5xl">🏆</Text>
          <Text className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
            {winner?.name ?? 'Someone'} wins!
          </Text>
          {winnerColor && (
            <View
              style={{ backgroundColor: PLAYER_HEX[winnerColor] }}
              className="my-4 h-4 w-24 rounded-full"
            />
          )}
          <View className="mt-2 w-full gap-3">
            <Button label="Play Again" onPress={onPlayAgain} size="lg" />
            <Button label="Home" variant="secondary" onPress={onHome} size="lg" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
