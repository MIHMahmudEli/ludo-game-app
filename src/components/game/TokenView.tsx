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
import { baseSlotCoord, coordForPosition, PLAYER_HEX, PLAYER_HEX_DARK, TIMINGS } from '@/constants';
import { useIsTokenMovable, useToken } from '@/store';
import { ANIMATION_SPEED_FACTOR, useSettingsStore } from '@/store';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TokenViewProps {
  tokenId: string;
  cell: number;
  onPress: (id: string) => void;
}

/**
 * A single animated token.
 *
 * Subscribes only to its own token + movable flag, so it re-renders in
 * isolation (the engine preserves identity for untouched tokens). Movement is a
 * Reanimated glide on the UI thread — the React tree doesn't animate per frame.
 */
function TokenViewComponent({ tokenId, cell, onPress }: TokenViewProps) {
  const token = useToken(tokenId);
  const movable = useIsTokenMovable(tokenId);
  const animationSpeed = useSettingsStore((s) => s.animationSpeed);
  const duration = TIMINGS.MOVE_DURATION * ANIMATION_SPEED_FACTOR[animationSpeed];

  const size = cell * 0.7;
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const pulse = useSharedValue(1);

  // Resolve the token's target grid coordinate → centred pixel position.
  let target: readonly [number, number];
  if (!token || token.state === 'base') {
    target = baseSlotCoord(token?.color ?? 'red', token?.index ?? 0);
  } else {
    target = coordForPosition(token.color, token.position);
  }
  // Slight per-token offset so stacked tokens remain distinguishable.
  const jitter = token ? token.index * 1.5 : 0;
  const targetX = (target[1] + 0.5) * cell - size / 2 + jitter;
  const targetY = (target[0] + 0.5) * cell - size / 2 + jitter;

  // Initialise without animating on first mount, then glide on changes.
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
  }, [targetX, targetY, duration, tx, ty, mounted]);

  // Pulse highlight while the token is a legal choice.
  useEffect(() => {
    if (movable) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.14, { duration: 380 }),
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
      { translateY: ty.value },
      { scale: pulse.value },
    ],
  }));

  if (!token) return null;

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
        },
        style,
      ]}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: PLAYER_HEX[token.color],
          borderColor: movable ? '#FFFFFF' : PLAYER_HEX_DARK[token.color],
          borderWidth: movable ? 3 : 2,
          alignItems: 'center',
          justifyContent: 'center',
          // Elevation/shadow gives the token a tactile, raised look.
          shadowColor: '#000',
          shadowOpacity: 0.3,
          shadowRadius: 2,
          shadowOffset: { width: 0, height: 1 },
          elevation: 4,
        }}
      >
        <View
          style={{
            width: size * 0.34,
            height: size * 0.34,
            borderRadius: size * 0.17,
            backgroundColor: '#FFFFFF',
            opacity: 0.9,
          }}
        />
      </View>
    </AnimatedPressable>
  );
}

export const TokenView = memo(TokenViewComponent);
