import { memo, useEffect } from 'react';
import { Pressable, View } from 'react-native';
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
 * A single animated, glossy map-pin token (the classic Ludo King teardrop
 * shape, original art). Subscribes only to its own token + movable flag, so it
 * re-renders in isolation; movement is a Reanimated UI-thread glide with a hop.
 */
function TokenViewComponent({ tokenId, cell, onPress }: TokenViewProps) {
  const token = useToken(tokenId);
  const movable = useIsTokenMovable(tokenId);
  const animationSpeed = useSettingsStore((s) => s.animationSpeed);
  const duration = TIMINGS.MOVE_DURATION * ANIMATION_SPEED_FACTOR[animationSpeed];

  const box = cell * 0.84; // bounding box
  const pin = box * 0.82; // teardrop size
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
  const jitter = token ? token.index * 1.5 : 0;
  const targetX = (target[1] + 0.5) * cell - box / 2 + jitter;
  const targetY = (target[0] + 0.5) * cell - box / 2 + jitter;

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
      withTiming(-cell * 0.22, { duration: duration / 2 }),
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
  const offset = (box - pin) / 2;

  return (
    <AnimatedPressable
      onPress={() => onPress(tokenId)}
      disabled={!movable}
      hitSlop={6}
      style={[
        {
          position: 'absolute',
          left: 0,
          top: 0,
          width: box,
          height: box,
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 2 },
          elevation: 6,
        },
        style,
      ]}
    >
      {/* Teardrop pin: square with one sharp corner, rotated so the tip points down. */}
      <View
        style={{
          position: 'absolute',
          left: offset,
          top: offset * 0.4,
          width: pin,
          height: pin,
          backgroundColor: PLAYER_HEX[color],
          borderTopLeftRadius: pin / 2,
          borderTopRightRadius: pin / 2,
          borderBottomLeftRadius: pin / 2,
          borderBottomRightRadius: pin * 0.12,
          borderWidth: movable ? 3 : 2,
          borderColor: movable ? '#FFFFFF' : PLAYER_HEX_DARK[color],
          transform: [{ rotate: '45deg' }],
        }}
      >
        {/* Inner white eye (rotation-invariant, stays centred). */}
        <View
          style={{
            position: 'absolute',
            top: pin / 2 - pin * 0.21,
            left: pin / 2 - pin * 0.21,
            width: pin * 0.42,
            height: pin * 0.42,
            borderRadius: pin * 0.21,
            backgroundColor: '#FFFFFF',
          }}
        />
        {/* Gloss highlight. */}
        <View
          style={{
            position: 'absolute',
            top: pin * 0.16,
            left: pin * 0.16,
            width: pin * 0.3,
            height: pin * 0.3,
            borderRadius: pin * 0.15,
            backgroundColor: PLAYER_HEX_LIGHT[color],
            opacity: 0.7,
          }}
        />
      </View>
    </AnimatedPressable>
  );
}

export const TokenView = memo(TokenViewComponent);
