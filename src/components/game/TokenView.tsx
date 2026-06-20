import { memo, useEffect } from 'react';
import { Pressable } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {
  baseSlotCoord,
  coordForPosition,
  PLAYER_HEX,
  PLAYER_HEX_DARK,
  PLAYER_HEX_LIGHT,
  TIMINGS,
} from '@/constants';
import { useIsTokenMovable, useToken } from '@/store';
import { ANIMATION_SPEED_FACTOR, useSettingsStore } from '@/store';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TokenViewProps {
  tokenId: string;
  cell: number;
  onPress: (id: string) => void;
}

/**
 * A single animated map-pin token: a round head with a pointed bottom, taller
 * than it is wide so the head sits above the cell's circle while the pin stays
 * centred on its cell/yard slot. Subscribes only to its own token + movable
 * flag; movement is a Reanimated UI-thread glide.
 */
function TokenViewComponent({ tokenId, cell, onPress }: TokenViewProps) {
  const token = useToken(tokenId);
  const movable = useIsTokenMovable(tokenId);
  const animationSpeed = useSettingsStore((s) => s.animationSpeed);
  const duration = TIMINGS.MOVE_DURATION * ANIMATION_SPEED_FACTOR[animationSpeed];

  // Pin geometry — taller than wide so the head clears the circle.
  const W = cell * 0.64;
  const H = cell * 0.96;
  const rH = W / 2; // head radius

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const pulse = useSharedValue(1);
  const lift = useSharedValue(0);

  let target: readonly [number, number];
  if (!token || token.state === 'base') {
    target = baseSlotCoord(token?.color ?? 'red', token?.index ?? 0);
  } else {
    target = coordForPosition(token.color, token.position);
  }
  // Centre the pin box on the cell.
  const targetX = (target[1] + 0.5) * cell - W / 2;
  const targetY = (target[0] + 0.5) * cell - H / 2;

  const mounted = useSharedValue(false);
  useEffect(() => {
    if (!mounted.value) {
      tx.value = targetX;
      ty.value = targetY;
      mounted.value = true;
      return;
    }
    tx.value = withTiming(targetX, { duration });
    ty.value = withTiming(targetY, { duration });
    lift.value = withSequence(
      withTiming(-cell * 0.2, { duration: duration / 2 }),
      withTiming(0, { duration: duration / 2 }),
    );
  }, [targetX, targetY, duration, cell, tx, ty, lift, mounted]);

  useEffect(() => {
    if (movable) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.16, { duration: 380 }),
          withTiming(1, { duration: 380 }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 150 });
    }
  }, [movable, pulse]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value + lift.value },
      { scale: pulse.value },
    ],
  }));

  if (!token) return null;
  const color = token.color;

  // Pin outline: round head (diameter W) tapering to a point at (W/2, H).
  const pinPath =
    `M ${W / 2},${H} ` +
    `C ${W * 0.06},${H * 0.6} 0,${rH + W * 0.12} 0,${rH} ` +
    `A ${rH},${rH} 0 1 1 ${W},${rH} ` +
    `C ${W},${rH + W * 0.12} ${W * 0.94},${H * 0.6} ${W / 2},${H} Z`;

  return (
    <AnimatedPressable
      onPress={() => onPress(tokenId)}
      disabled={!movable}
      hitSlop={8}
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: H,
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 2.5,
          shadowOffset: { width: 0, height: 2 },
          elevation: 6,
        },
        style,
      ]}
    >
      <Svg width={W} height={H}>
        <Path
          d={pinPath}
          fill={PLAYER_HEX[color]}
          stroke={movable ? '#FFFFFF' : PLAYER_HEX_DARK[color]}
          strokeWidth={movable ? 3 : 2}
        />
        {/* White eye centred in the head. */}
        <Circle cx={W / 2} cy={rH} r={W * 0.22} fill="#FFFFFF" />
        {/* Gloss highlight. */}
        <Circle cx={W * 0.36} cy={rH * 0.72} r={W * 0.12} fill={PLAYER_HEX_LIGHT[color]} />
      </Svg>
    </AnimatedPressable>
  );
}

export const TokenView = memo(TokenViewComponent);
