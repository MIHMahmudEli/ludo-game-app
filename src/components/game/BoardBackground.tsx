import { memo } from 'react';
import Svg, {
  Circle,
  Defs,
  G,
  LinearGradient,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';
import {
  BASE_QUADRANT,
  BASE_SLOT_COORDS,
  BOARD_HEX,
  ENTRY_INDEX,
  HOME_COLUMN_COORDS,
  PLAYER_HEX,
  PLAYER_HEX_DARK,
  PLAYER_HEX_LIGHT,
  PLAYER_HEX_SOFT,
  RING_COORDS,
  SAFE_RING_INDICES,
} from '@/constants';
import { PLAYER_COLORS, type PlayerColor } from '@/types';

interface BoardBackgroundProps {
  boardSize: number;
  isDark: boolean;
}

const START_INDEX_TO_COLOR = new Map<number, PlayerColor>(
  (Object.entries(ENTRY_INDEX) as [PlayerColor, number][]).map(([c, i]) => [i, c]),
);

/**
 * Static, glossy SVG board (original gradient art). Depends only on `boardSize`
 * + colour scheme, so it is memoised and never re-renders while tokens move.
 */
function BoardBackgroundComponent({ boardSize, isDark }: BoardBackgroundProps) {
  const cell = boardSize / 15;
  const board = isDark ? BOARD_HEX.dark : BOARD_HEX.light;
  const radius = cell * 0.16;

  const left = 6 * cell;
  const right = 9 * cell;
  const top = 6 * cell;
  const bottom = 9 * cell;
  const cx = 7.5 * cell;
  const cy = 7.5 * cell;

  const trianglePoints: Record<PlayerColor, string> = {
    green: `${left},${top} ${right},${top} ${cx},${cy}`,
    yellow: `${right},${top} ${right},${bottom} ${cx},${cy}`,
    blue: `${right},${bottom} ${left},${bottom} ${cx},${cy}`,
    red: `${left},${bottom} ${left},${top} ${cx},${cy}`,
  };

  return (
    <Svg width={boardSize} height={boardSize}>
      <Defs>
        {/* Subtle vertical sheen on the board surface. */}
        <LinearGradient id="boardBg" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={board.cell} />
          <Stop offset="1" stopColor={board.background} />
        </LinearGradient>
        {PLAYER_COLORS.map((color) => (
          <LinearGradient key={`qg-${color}`} id={`q-${color}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={PLAYER_HEX_LIGHT[color]} />
            <Stop offset="1" stopColor={PLAYER_HEX[color]} />
          </LinearGradient>
        ))}
        {PLAYER_COLORS.map((color) => (
          <LinearGradient key={`tg-${color}`} id={`t-${color}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={PLAYER_HEX_LIGHT[color]} />
            <Stop offset="1" stopColor={PLAYER_HEX_DARK[color]} />
          </LinearGradient>
        ))}
      </Defs>

      <Rect x={0} y={0} width={boardSize} height={boardSize} fill="url(#boardBg)" />

      {/* Yards */}
      {PLAYER_COLORS.map((color) => {
        const q = BASE_QUADRANT[color];
        return (
          <G key={`base-${color}`}>
            <Rect
              x={q.col * cell}
              y={q.row * cell}
              width={q.size * cell}
              height={q.size * cell}
              rx={cell * 0.45}
              fill={`url(#q-${color})`}
            />
            <Rect
              x={(q.col + 0.9) * cell}
              y={(q.row + 0.9) * cell}
              width={(q.size - 1.8) * cell}
              height={(q.size - 1.8) * cell}
              rx={cell * 0.3}
              fill={board.cell}
              opacity={0.96}
            />
            {BASE_SLOT_COORDS[color].map(([r, c], i) => (
              <Circle
                key={`slot-${color}-${i}`}
                cx={(c + 0.5) * cell}
                cy={(r + 0.5) * cell}
                r={cell * 0.36}
                fill={PLAYER_HEX_SOFT[color]}
                stroke={PLAYER_HEX[color]}
                strokeWidth={2}
              />
            ))}
          </G>
        );
      })}

      {/* Shared ring */}
      {RING_COORDS.map(([r, c], i) => {
        const startColor = START_INDEX_TO_COLOR.get(i);
        return (
          <Rect
            key={`ring-${i}`}
            x={c * cell + 0.5}
            y={r * cell + 0.5}
            width={cell - 1}
            height={cell - 1}
            rx={radius}
            fill={startColor ? `url(#q-${startColor})` : board.cell}
            stroke={board.grid}
            strokeWidth={1}
          />
        );
      })}

      {/* Home columns */}
      {PLAYER_COLORS.map((color) =>
        HOME_COLUMN_COORDS[color].map(([r, c], i) => (
          <Rect
            key={`home-${color}-${i}`}
            x={c * cell + 0.5}
            y={r * cell + 0.5}
            width={cell - 1}
            height={cell - 1}
            rx={radius}
            fill={`url(#q-${color})`}
            stroke={board.grid}
            strokeWidth={1}
          />
        )),
      )}

      {/* Centre home triangles (glossy gradient) */}
      {PLAYER_COLORS.map((color) => (
        <Polygon
          key={`tri-${color}`}
          points={trianglePoints[color]}
          fill={`url(#t-${color})`}
          stroke={board.grid}
          strokeWidth={1}
        />
      ))}

      {/* Safe-cell stars */}
      {SAFE_RING_INDICES.map((i) => {
        const [r, c] = RING_COORDS[i]!;
        const startColor = START_INDEX_TO_COLOR.get(i);
        return (
          <SvgText
            key={`star-${i}`}
            x={(c + 0.5) * cell}
            y={(r + 0.72) * cell}
            fontSize={cell * 0.62}
            fill={startColor ? '#FFFFFF' : isDark ? '#CBD5E1' : '#94A3B8'}
            textAnchor="middle"
          >
            ★
          </SvgText>
        );
      })}
    </Svg>
  );
}

export const BoardBackground = memo(BoardBackgroundComponent);
