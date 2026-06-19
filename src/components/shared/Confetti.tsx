import { useEffect, useMemo } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { PLAYER_HEX } from '@/constants';

const COLORS = [
  PLAYER_HEX.red,
  PLAYER_HEX.green,
  PLAYER_HEX.yellow,
  PLAYER_HEX.blue,
  '#FBBF24',
  '#F472B6',
];

interface PieceProps {
  startX: number;
  endY: number;
  delay: number;
  duration: number;
  drift: number;
  color: string;
  size: number;
}

function Piece({ startX, endY, delay, duration, drift, color, size }: PieceProps) {
  const progress = useSharedValue(0);
  const spin = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration, easing: Easing.linear }));
    spin.value = withRepeat(withTiming(360, { duration: 900, easing: Easing.linear }), -1);
  }, [delay, duration, progress, spin]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: startX + interpolate(progress.value, [0, 1], [0, drift]) },
      { translateY: interpolate(progress.value, [0, 1], [-40, endY]) },
      { rotate: `${spin.value}deg` },
    ],
    opacity: interpolate(progress.value, [0, 0.85, 1], [1, 1, 0]),
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size * 0.6,
          borderRadius: 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

/** Lightweight original confetti burst (≈30 pieces) for the win celebration. */
export function Confetti({ count = 30 }: { count?: number }) {
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        key: i,
        startX: Math.random() * width,
        endY: height + 40,
        delay: Math.random() * 600,
        duration: 1800 + Math.random() * 1200,
        drift: (Math.random() - 0.5) * 120,
        color: COLORS[i % COLORS.length]!,
        size: 8 + Math.random() * 6,
      })),
    [count, width, height],
  );

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map(({ key, ...rest }) => (
        <Piece key={key} {...rest} />
      ))}
    </View>
  );
}
