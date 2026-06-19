import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import type { DiceValue, PlayerColor } from '@/types';
import { PLAYER_HEX } from '@/constants';

interface DiceProps {
  value: DiceValue | null;
  isRolling: boolean;
  color: PlayerColor;
  disabled: boolean;
  onPress: () => void;
}

// Which of the 3x3 dot slots are filled for each face.
const FACES: Record<DiceValue, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

const DIE = 72;

/**
 * Animated die. Spins while rolling (flickering faces), then pops to the final
 * value. Pure presentation — it only renders the `value`/`isRolling` props.
 */
export function Dice({ value, isRolling, color, disabled, onPress }: DiceProps) {
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const [face, setFace] = useState<DiceValue>(value ?? 1);

  // Flicker the displayed face while rolling for a "tumbling" feel.
  useEffect(() => {
    if (!isRolling) {
      if (value) setFace(value);
      return;
    }
    const interval = setInterval(() => {
      setFace((Math.floor(Math.random() * 6) + 1) as DiceValue);
    }, 80);
    return () => clearInterval(interval);
  }, [isRolling, value]);

  useEffect(() => {
    if (isRolling) {
      rotate.value = withRepeat(
        withTiming(360, { duration: 500, easing: Easing.linear }),
        -1,
      );
    } else {
      cancelAnimation(rotate);
      rotate.value = withTiming(0, { duration: 150 });
      // Bouncy "landing" so the die feels like it drops onto the tray.
      scale.value = withSequence(
        withTiming(1.25, { duration: 110 }),
        withTiming(0.9, { duration: 90 }),
        withTiming(1.08, { duration: 90 }),
        withTiming(1, { duration: 90 }),
      );
    }
  }, [isRolling, rotate, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: scale.value }],
  }));

  const dots = FACES[face];

  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button">
      <Animated.View
        style={[
          {
            width: DIE,
            height: DIE,
            borderRadius: 16,
            backgroundColor: '#FFFFFF',
            borderWidth: 3,
            borderColor: PLAYER_HEX[color],
            padding: DIE * 0.12,
            opacity: disabled ? 0.55 : 1,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 5,
          },
          style,
        ]}
      >
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignContent: 'space-between',
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              style={{
                width: '30%',
                height: '30%',
                borderRadius: 999,
                backgroundColor: dots.includes(i) ? '#1E293B' : 'transparent',
              }}
            />
          ))}
        </View>
      </Animated.View>
    </Pressable>
  );
}
