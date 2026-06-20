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
import { PLAYER_HEX, PLAYER_HEX_DARK } from '@/constants';
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

interface PlayerCornerProps {
  color: PlayerColor;
  onRoll: () => void;
}

/**
 * A player's dedicated dice corner: their own die plus an avatar/progress chip.
 * The whole section glows and pulses on their turn (no text label needed), dims
 * otherwise, and only the active human's die is interactive.
 */
export function PlayerCorner({ color, onRoll }: PlayerCornerProps) {
  const turn = useTurn();
  const players = usePlayers();
  const tokens = useTokensByColor(color);
  const dice = useDice();
  const phase = usePhase();
  const locked = useInputLocked();

  const player = players.find((p) => p.color === color);
  const active = turn?.currentColor === color;
  const isHuman = player?.type === 'human';
  const canRoll = active && phase === 'awaiting-roll' && !locked && isHuman;
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
          withTiming(0.35, { duration: 700 }),
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
    <View style={{ opacity: active ? 1 : 0.5 }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: -6,
            left: -6,
            right: -6,
            bottom: -6,
            borderRadius: 20,
            backgroundColor: PLAYER_HEX[color],
          },
          haloStyle,
        ]}
      />
      <Animated.View
        style={[
          {
            alignItems: 'center',
            gap: 5,
            borderRadius: 16,
            borderWidth: 2.5,
            borderColor: active ? PLAYER_HEX[color] : '#E2E8F0',
            backgroundColor: '#FFFFFF',
            paddingHorizontal: 10,
            paddingVertical: 8,
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
          size={46}
        />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View
            style={{
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: PLAYER_HEX[color],
              borderWidth: 1.5,
              borderColor: PLAYER_HEX_DARK[color],
            }}
          />
          <Text
            numberOfLines={1}
            style={{ maxWidth: 78, fontSize: 12, fontWeight: '800', color: '#1E293B' }}
          >
            {player.name}
          </Text>
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#94A3B8' }}>
            {homeCount}/4
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
