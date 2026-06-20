import { memo, useEffect } from 'react';
import { Pressable } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';
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
import { useIsTokenMovable, useToken, useTokenCluster } from '@/store';
import { ANIMATION_SPEED_FACTOR, useSettingsStore } from '@/store';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// A location-pin silhouette in a 24x24 viewBox: round head, point at the bottom.
const PIN_PATH = 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z';
const TIP_FX = 0.5; // tip x within the box (fraction)
const TIP_FY = 22 / 24; // tip y within the box (fraction)
const HEAD_FY = 9 / 24; // head-centre y within the box (fraction)

interface TokenViewProps {
  tokenId: string;
  cell: number;
  onPress: (id: string) => void;
}

/**
 * A single animated, realistic map-pin token: round 3D head (colour gradient +
 * gloss + white "eye") tapering to a point. The pin's tip is anchored on the
 * cell/circle centre with the head above — classic Ludo pin behaviour.
 * Subscribes only to its own token + movable flag; movement is a Reanimated glide.
 */
function TokenViewComponent({ tokenId, cell, onPress }: TokenViewProps) {
  const token = useToken(tokenId);
  const movable = useIsTokenMovable(tokenId);
  const { index, count } = useTokenCluster(tokenId);
  const animationSpeed = useSettingsStore((s) => s.animationSpeed);
  const duration = TIMINGS.MOVE_DURATION * ANIMATION_SPEED_FACTOR[animationSpeed];

  const size = cell * 1.08; // square svg box; the pin fills ~0.6 x 0.9 of it

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const pulse = useSharedValue(1);
  const lift = useSharedValue(0);
  const cscale = useSharedValue(1);

  // When pins stack on a cell, fan the non-active ones out and shrink them so
  // all are visible; the active/movable pin stays centred at full size.
  let dx = 0;
  let dy = 0;
  let clusterScale = 1;
  if (count > 1 && !movable) {
    const radius = cell * 0.24;
    const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
    dx = Math.cos(angle) * radius;
    dy = Math.sin(angle) * radius;
    clusterScale = count === 2 ? 0.82 : count === 3 ? 0.72 : 0.64;
  }

  let target: readonly [number, number];
  if (!token || token.state === 'base') {
    target = baseSlotCoord(token?.color ?? 'red', token?.index ?? 0);
  } else {
    target = coordForPosition(token.color, token.position);
  }
  // Anchor the pin tip on the cell centre (+ cluster fan offset).
  const targetX = (target[1] + 0.5) * cell - size * TIP_FX + dx;
  const targetY = (target[0] + 0.5) * cell - size * TIP_FY + dy;

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
          withTiming(1.12, { duration: 400 }),
          withTiming(1, { duration: 400 }),
        ),
        -1,
        true,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 150 });
    }
  }, [movable, pulse]);

  useEffect(() => {
    cscale.value = withTiming(clusterScale, { duration: 200 });
  }, [clusterScale, cscale]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value + lift.value },
      { scale: pulse.value * cscale.value },
    ],
  }));

  if (!token) return null;
  const color = token.color;
  const gid = `pin-${tokenId}`;

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
          width: size,
          height: size,
          // Active pin sits above the rest of a cluster.
          zIndex: movable ? 30 : 10,
          shadowColor: '#000',
          shadowOpacity: 0.35,
          shadowRadius: 3,
          shadowOffset: { width: 0, height: 3 },
          elevation: 6,
        },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Defs>
          <LinearGradient id={gid} x1="0" y1="0" x2="0.35" y2="1">
            <Stop offset="0" stopColor={PLAYER_HEX_LIGHT[color]} />
            <Stop offset="0.5" stopColor={PLAYER_HEX[color]} />
            <Stop offset="1" stopColor={PLAYER_HEX_DARK[color]} />
          </LinearGradient>
        </Defs>
        <Path
          d={PIN_PATH}
          fill={`url(#${gid})`}
          stroke={movable ? '#FACC15' : '#FFFFFF'}
          strokeWidth={movable ? 1.4 : 1}
        />
        {/* Centre eye. */}
        <Circle cx={12} cy={9} r={3.1} fill="#FFFFFF" />
        <Circle cx={12} cy={9} r={3.1} fill="none" stroke={PLAYER_HEX_DARK[color]} strokeWidth={0.5} />
        {/* Gloss highlight on the head. */}
        <Ellipse cx={9.6} cy={6.4} rx={1.9} ry={2.4} fill="#FFFFFF" opacity={0.4} />
      </Svg>
    </AnimatedPressable>
  );
}

export const TokenView = memo(TokenViewComponent);
