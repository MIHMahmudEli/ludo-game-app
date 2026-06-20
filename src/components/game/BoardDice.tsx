import { useEffect } from 'react';
import { View } from 'react-native';
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
import {
  useDice,
  useInputLocked,
  usePhase,
  usePlayers,
  useTurn,
} from '@/store';
import { Dice } from './Dice';

interface BoardDiceProps {
  color: PlayerColor;
  cell: number;
  boardSize: number;
  onRoll: () => void;
}

/** Which board corner each colour's dice hangs off (fraction of board size). */
const CORNER: Record<PlayerColor, { fx: 0 | 1; fy: 0 | 1 }> = {
  red: { fx: 0, fy: 0 }, // top-left
  green: { fx: 1, fy: 0 }, // top-right
  yellow: { fx: 1, fy: 1 }, // bottom-right
  blue: { fx: 0, fy: 1 }, // bottom-left
};

/**
 * A player's dice, rendered in the middle of their home base (the board's
 * corner). Glows and pulses on their turn, dims otherwise, and is interactive
 * only for the active human — giving a text-free "whose turn" cue in place.
 */
export function BoardDice({ color, cell, boardSize, onRoll }: BoardDiceProps) {
  const turn = useTurn();
  const players = usePlayers();
  const dice = useDice();
  const phase = usePhase();
  const locked = useInputLocked();

  const player = players.find((p) => p.color === color);
  const active = turn?.currentColor === color;
  const canRoll =
    active && phase === 'awaiting-roll' && !locked && player?.type === 'human';

  const halo = useSharedValue(0);

  useEffect(() => {
    if (active) {
      halo.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 700 }),
          withTiming(0.4, { duration: 700 }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(halo);
      halo.value = withTiming(0, { duration: 200 });
    }
  }, [active, halo]);

  const haloStyle = useAnimatedStyle(() => ({
    opacity: halo.value * 0.55,
    transform: [{ scale: 1 + halo.value * 0.18 }],
  }));

  if (!player) return null;

  const size = cell * 2.1;
  const corner = CORNER[color];
  // Centre the dice on the board corner so it sits just outside it.
  const left = corner.fx * boardSize - size / 2;
  const top = corner.fy * boardSize - size / 2;

  return (
    <View
      style={{
        position: 'absolute',
        left,
        top,
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: active ? 1 : 0.5,
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: PLAYER_HEX[color],
          },
          haloStyle,
        ]}
      />
      <Dice
        value={active ? dice.value : null}
        isRolling={active ? dice.isRolling : false}
        color={color}
        disabled={!canRoll}
        onPress={onRoll}
        size={cell * 1.45}
      />
    </View>
  );
}
