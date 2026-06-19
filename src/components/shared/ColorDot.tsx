import { View } from 'react-native';
import type { PlayerColor } from '@/types';
import { PLAYER_HEX } from '@/constants';

interface ColorDotProps {
  color: PlayerColor;
  size?: number;
}

/** Reusable player-colour swatch used across panels and indicators. */
export function ColorDot({ color, size = 16 }: ColorDotProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: PLAYER_HEX[color],
      }}
    />
  );
}
