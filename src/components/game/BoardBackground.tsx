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
  PLAYER_HEX_DARK,
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

/** Entry-arrow cell + direction for each colour's home path. */
const ARROWS: Record<PlayerColor, { r: number; c: number; dir: 'up' | 'down' | 'left' | 'right' }> = {
  red: { r: 7, c: 0, dir: 'right' },
  green: { r: 0, c: 7, dir: 'down' },
  yellow: { r: 7, c: 14, dir: 'left' },
  blue: { r: 14, c: 7, dir: 'up' },
};

function arrowPoints(r: number, c: number, dir: string, cell: number): string {
  const x = c * cell;
  const y = r * cell;
  const u = cell;
  const tri =
    dir === 'right'
      ? [[0.2, 0.25], [0.2, 0.75], [0.78, 0.5]]
      : dir === 'left'
        ? [[0.8, 0.25], [0.8, 0.75], [0.22, 0.5]]
        : dir === 'down'
          ? [[0.25, 0.2], [0.75, 0.2], [0.5, 0.78]]
          : [[0.25, 0.8], [0.75, 0.8], [0.5, 0.22]];
  return tri.map(([dx, dy]) => `${x + dx! * u},${y + dy! * u}`).join(' ');
}

/**
 * Static, flat "classic" SVG board matching the reference art: solid colour
 * quadrants with white token panels, a white grid track, solid home paths, a
 * centre pinwheel, entry arrows and safe-cell stars. Memoised on size + scheme,
 * so it never re-renders while tokens move.
 */
function BoardBackgroundComponent({ boardSize, isDark }: BoardBackgroundProps) {
  const cell = boardSize / 15;
  const board = isDark ? BOARD_HEX.dark : BOARD_HEX.light;

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
              fill={PLAYER_HEX[color]}
            />
            <Rect
              x={(q.col + 1) * cell}
              y={(q.row + 1) * cell}
              width={(q.size - 2) * cell}
              height={(q.size - 2) * cell}
              rx={cell * 0.18}
              fill={board.cell}
            />
            {BASE_SLOT_COORDS[color].map(([r, c], i) => (
              <Circle
                key={`slot-${color}-${i}`}
                cx={(c + 0.5) * cell}
                cy={(r + 0.5) * cell}
                r={cell * 0.32}
                fill="none"
                stroke={PLAYER_HEX[color]}
                strokeWidth={2.5}
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
            x={c * cell}
            y={r * cell}
            width={cell}
            height={cell}
            fill={startColor ? PLAYER_HEX[startColor] : board.cell}
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

      {/* Entry arrows */}
      {PLAYER_COLORS.map((color) => {
        const a = ARROWS[color];
        return (
          <Polygon
            key={`arrow-${color}`}
            points={arrowPoints(a.r, a.c, a.dir, cell)}
            fill={PLAYER_HEX_DARK[color]}
          />
        );
      })}

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
