import { memo, useEffect } from 'react';
import { Pressable } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { baseSlotCoord, coordForPosition, PLAYER_HEX, TIMINGS } from '@/constants';
import { useIsTokenMovable, useToken } from '@/store';
import { ANIMATION_SPEED_FACTOR, useSettingsStore } from '@/store';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface TokenViewProps {
  tokenId: string;
  cell: number;
  onPress: (id: string) => void;
}

/**
 * A single animated token disc: a shared white outer ring (same for every
 * player) with the player's colour on the inside, centred exactly on its
 * cell/yard circle. Small enough never to clip. Subscribes only to its own
 * token + movable flag; movement is a Reanimated UI-thread glide.
 */
function TokenViewComponent({ tokenId, cell, onPress }: TokenViewProps) {
  const token = useToken(tokenId);
  const movable = useIsTokenMovable(tokenId);
  const animationSpeed = useSettingsStore((s) => s.animationSpeed);
  const duration = TIMINGS.MOVE_DURATION * ANIMATION_SPEED_FACTOR[animationSpeed];

  const pad = 4; // breathing room so the stroke never clips
  const D = cell * 0.74; // token diameter
  const svg = D + pad * 2;
  const c = svg / 2; // centre of the svg box
  const R = D / 2;

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
  // Centre the svg box on the cell.
  const targetX = (target[1] + 0.5) * cell - svg / 2;
  const targetY = (target[0] + 0.5) * cell - svg / 2;

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
          withTiming(1.18, { duration: 380 }),
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
          width: svg,
          height: svg,
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 2.5,
          shadowOffset: { width: 0, height: 2 },
          elevation: 6,
        },
        style,
      ]}
    >
      <Svg width={svg} height={svg}>
        {/* Shared white outer ring (same for all players) + rim. */}
        <Circle
          cx={c}
          cy={c}
          r={R - 1}
          fill="#FFFFFF"
          stroke={movable ? '#F59E0B' : '#334155'}
          strokeWidth={movable ? 3 : 2}
        />
        {/* Inner disc in the player's colour. */}
        <Circle cx={c} cy={c} r={R * 0.74} fill={PLAYER_HEX[color]} />
        {/* Gloss highlight. */}
        <Circle cx={c - R * 0.26} cy={c - R * 0.26} r={R * 0.2} fill="#FFFFFF" opacity={0.5} />
      </Svg>
    </AnimatedPressable>
  );
}

export const TokenView = memo(TokenViewComponent);
