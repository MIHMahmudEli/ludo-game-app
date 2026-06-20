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
 * A single animated flat teardrop-pin token: a rounded body with one pointed
 * corner, a shared white outer border (gold while it's a legal move) and the
 * player's colour inside. The bounding box is centred on the cell, and the pin
 * is flex-centred in it, so the token stays precisely on its cell/yard circle.
 */
function TokenViewComponent({ tokenId, cell, onPress }: TokenViewProps) {
  const token = useToken(tokenId);
  const movable = useIsTokenMovable(tokenId);
  const animationSpeed = useSettingsStore((s) => s.animationSpeed);
  const duration = TIMINGS.MOVE_DURATION * ANIMATION_SPEED_FACTOR[animationSpeed];

  const box = cell * 0.82; // square bounding box, centred on the cell
  const pin = cell * 0.6; // teardrop side (its diagonal ≈ 0.85 cell)

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
  const targetX = (target[1] + 0.5) * cell - box / 2;
  const targetY = (target[0] + 0.5) * cell - box / 2;

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
          width: box,
          height: box,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.4,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 2 },
          elevation: 6,
        },
        style,
      ]}
    >
      {/* Teardrop: square with one sharp corner, rotated so the tip points down. */}
      <View
        style={{
          width: pin,
          height: pin,
          backgroundColor: PLAYER_HEX[color],
          borderTopLeftRadius: pin / 2,
          borderTopRightRadius: pin / 2,
          borderBottomLeftRadius: pin / 2,
          borderBottomRightRadius: pin * 0.12,
          borderWidth: movable ? 3 : 2.5,
          borderColor: movable ? '#F59E0B' : '#FFFFFF',
          transform: [{ rotate: '45deg' }],
        }}
      >
        {/* White eye, centred (rotation-invariant). */}
        <View
          style={{
            position: 'absolute',
            top: pin / 2 - pin * 0.2,
            left: pin / 2 - pin * 0.2,
            width: pin * 0.4,
            height: pin * 0.4,
            borderRadius: pin * 0.2,
            backgroundColor: '#FFFFFF',
          }}
        />
        {/* Gloss highlight on the head. */}
        <View
          style={{
            position: 'absolute',
            top: pin * 0.14,
            left: pin * 0.14,
            width: pin * 0.28,
            height: pin * 0.28,
            borderRadius: pin * 0.14,
            backgroundColor: PLAYER_HEX_LIGHT[color],
            opacity: 0.75,
          }}
        />
      </View>
    </AnimatedPressable>
  );
}

export const TokenView = memo(TokenViewComponent);
