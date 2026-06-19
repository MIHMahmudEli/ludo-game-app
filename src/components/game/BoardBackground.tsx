import { memo } from 'react';
import Svg, {
  Circle,
  G,
  Polygon,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import {
  BASE_QUADRANT,
  BASE_SLOT_COORDS,
  BOARD_HEX,
  ENTRY_INDEX,
  HOME_COLUMN_COORDS,
  PLAYER_HEX,
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
 * Static SVG board. Depends only on `boardSize` + colour scheme, so it is
 * memoised and never re-renders while tokens move — a key rendering-perf win.
 */
function BoardBackgroundComponent({ boardSize, isDark }: BoardBackgroundProps) {
  const cell = boardSize / 15;
  const board = isDark ? BOARD_HEX.dark : BOARD_HEX.light;

  // Centre 3x3 geometry.
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
      <Rect x={0} y={0} width={boardSize} height={boardSize} fill={board.background} />

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
              rx={cell * 0.4}
              fill={PLAYER_HEX_SOFT[color]}
            />
            <Rect
              x={(q.col + 1) * cell}
              y={(q.row + 1) * cell}
              width={(q.size - 2) * cell}
              height={(q.size - 2) * cell}
              rx={cell * 0.25}
              fill={board.cell}
            />
            {BASE_SLOT_COORDS[color].map(([r, c], i) => (
              <Circle
                key={`slot-${color}-${i}`}
                cx={(c + 0.5) * cell}
                cy={(r + 0.5) * cell}
                r={cell * 0.34}
                fill={board.cell}
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
        const fill = startColor ? PLAYER_HEX_SOFT[startColor] : board.cell;
        return (
          <Rect
            key={`ring-${i}`}
            x={c * cell}
            y={r * cell}
            width={cell}
            height={cell}
            fill={fill}
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
            x={c * cell}
            y={r * cell}
            width={cell}
            height={cell}
            fill={PLAYER_HEX[color]}
            opacity={0.85}
            stroke={board.grid}
            strokeWidth={1}
          />
        )),
      )}

      {/* Centre home triangles */}
      {PLAYER_COLORS.map((color) => (
        <Polygon
          key={`tri-${color}`}
          points={trianglePoints[color]}
          fill={PLAYER_HEX[color]}
          stroke={board.grid}
          strokeWidth={1}
        />
      ))}

      {/* Safe-cell stars */}
      {SAFE_RING_INDICES.map((i) => {
        const [r, c] = RING_COORDS[i]!;
        return (
          <SvgText
            key={`star-${i}`}
            x={(c + 0.5) * cell}
            y={(r + 0.72) * cell}
            fontSize={cell * 0.6}
            fill={isDark ? '#CBD5E1' : '#64748B'}
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
