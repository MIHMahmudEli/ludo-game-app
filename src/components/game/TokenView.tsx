import { memo, useEffect } from 'react';
import { Pressable, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
 * A single animated, glossy 3D token (original art — gradient + highlight, not
 * Ludo King's pawn sprite). Subscribes only to its own token + movable flag, so
 * it re-renders in isolation; movement is a Reanimated UI-thread glide.
 */
function TokenViewComponent({ tokenId, cell, onPress }: TokenViewProps) {
  const token = useToken(tokenId);
  const movable = useIsTokenMovable(tokenId);
  const animationSpeed = useSettingsStore((s) => s.animationSpeed);
  const duration = TIMINGS.MOVE_DURATION * ANIMATION_SPEED_FACTOR[animationSpeed];

  const size = cell * 0.72;
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
  const targetX = (target[1] + 0.5) * cell - size / 2 + jitter;
  const targetY = (target[0] + 0.5) * cell - size / 2 + jitter;

  // Initialise without animating on first mount, then glide on changes with a
  // small "hop" (lift) so movement feels like a physical piece being placed.
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
          width: size,
          height: size,
          // The drop shadow gives the token a raised, tactile look.
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 2 },
          elevation: 6,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={[PLAYER_HEX_LIGHT[color], PLAYER_HEX[color], PLAYER_HEX_DARK[color]]}
        start={{ x: 0.25, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: movable ? 3 : 2,
          borderColor: movable ? '#FFFFFF' : PLAYER_HEX_DARK[color],
          overflow: 'hidden',
        }}
      >
        {/* Glossy highlight near the top-left for a 3D marble look. */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.12,
            left: size * 0.18,
            width: size * 0.5,
            height: size * 0.3,
            borderRadius: size * 0.25,
            backgroundColor: '#FFFFFF',
            opacity: 0.45,
          }}
        />
        {/* Center pip. */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.42,
            left: size * 0.42,
            width: size * 0.16,
            height: size * 0.16,
            borderRadius: size * 0.08,
            backgroundColor: '#FFFFFF',
            opacity: 0.85,
          }}
        />
      </LinearGradient>
    </AnimatedPressable>
  );
}

export const TokenView = memo(TokenViewComponent);
