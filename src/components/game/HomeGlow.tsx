import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { BASE_QUADRANT, PLAYER_HEX } from '@/constants';
import { usePlayers, useTurn } from '@/store';

interface HomeGlowProps {
  cell: number;
}

/**
 * A pulsing glowing border drawn over the active player's home quadrant, giving
 * the "whose turn" cue directly on the board without any text. Subscribes only
 * to the current colour, so it updates once per turn.
 */
export function HomeGlow({ cell }: HomeGlowProps) {
  const turn = useTurn();
  const players = usePlayers();
  const pulse = useSharedValue(0.55);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0.5, { duration: 750 }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const style = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const color = turn?.currentColor;
  if (!color || !players.some((p) => p.color === color)) return null;

  const q = BASE_QUADRANT[color];
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        {
          position: 'absolute',
          left: q.col * cell + 1,
          top: q.row * cell + 1,
          width: q.size * cell - 2,
          height: q.size * cell - 2,
          borderRadius: cell * 0.4,
          borderWidth: 4,
          borderColor: PLAYER_HEX[color],
        },
        style,
      ]}
    />
  );
}
