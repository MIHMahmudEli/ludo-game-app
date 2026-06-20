import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { PlayerColor } from '@/types';
import { PLAYER_HEX } from '@/constants';
import { TokenEngine } from '@/features/ludo-engine';
import {
  useDice,
  useInputLocked,
  usePhase,
  usePlayers,
  useTokensByColor,
  useTurn,
} from '@/store';
import { Dice } from './Dice';

export const DICE_BOX_SIZE = 70;

interface DiceBoxProps {
  color: PlayerColor;
  onRoll: () => void;
}

/**
 * A square dice box for one player, placed in a corner around the board. Holds
 * that player's die; the box glows and pulses on their turn (no turn text),
 * dims otherwise, and only the active human's die is interactive.
 */
export function DiceBox({ color, onRoll }: DiceBoxProps) {
  const turn = useTurn();
  const players = usePlayers();
  const tokens = useTokensByColor(color);
  const dice = useDice();
  const phase = usePhase();
  const locked = useInputLocked();

  const player = players.find((p) => p.color === color);
  const active = turn?.currentColor === color;
  const canRoll =
    active && phase === 'awaiting-roll' && !locked && player?.type === 'human';
  const homeCount = tokens.filter(TokenEngine.hasFinished).length;

  const scale = useSharedValue(1);
  const halo = useSharedValue(0);

  useEffect(() => {
    if (active) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 700 }),
          withTiming(1, { duration: 700 }),
        ),
        -1,
        true,
      );
      halo.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700 }),
          withTiming(0.4, { duration: 700 }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(scale);
      cancelAnimation(halo);
      scale.value = withTiming(1, { duration: 200 });
      halo.value = withTiming(0, { duration: 200 });
    }
  }, [active, scale, halo]);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const haloStyle = useAnimatedStyle(() => ({
    opacity: halo.value * 0.5,
    transform: [{ scale: 1 + halo.value * 0.12 }],
  }));

  if (!player) return null;

  return (
    <View style={{ width: DICE_BOX_SIZE, opacity: active ? 1 : 0.5 }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: -6,
            left: -6,
            right: -6,
            bottom: -6,
            borderRadius: 22,
            backgroundColor: PLAYER_HEX[color],
          },
          haloStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            width: DICE_BOX_SIZE,
            height: DICE_BOX_SIZE,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            borderRadius: 18,
            borderWidth: 3,
            borderColor: active ? PLAYER_HEX[color] : '#E2E8F0',
            backgroundColor: '#FFFFFF',
          },
          cardStyle,
        ]}
      >
        <Dice
          value={active ? dice.value : null}
          isRolling={active ? dice.isRolling : false}
          color={color}
          disabled={!canRoll}
          onPress={onRoll}
          size={38}
        />
        <Text style={{ fontSize: 11, fontWeight: '800', color: PLAYER_HEX[color] }}>
          {homeCount}/4
        </Text>
      </Animated.View>
    </View>
  );
}
