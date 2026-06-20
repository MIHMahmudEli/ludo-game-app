/* eslint-disable */
/**
 * Shared vector art for the classic Ludo board, used by both the launcher icon
 * and the splash screen so they never drift apart.
 *
 * `boardArt(ox, oy, size)` returns SVG markup (no <svg> wrapper) drawing the
 * full board inside a square at (ox, oy) of the given pixel `size`.
 */
const COL = {
  green: '#34A853',
  yellow: '#FBBC04',
  red: '#EA4335',
  blue: '#4285F4',
  white: '#FFFFFF',
  grid: '#C7CDD6',
  star: '#5F6B7A',
  border: '#E2E6EC',
};

function boardArt(ox, oy, size) {
  const C = size / 15;
  const px = (v) => (ox + v * C).toFixed(2);
  const py = (v) => (oy + v * C).toFixed(2);
  const len = (v) => (v * C).toFixed(2);

  const rect = (x, y, w, h, fill, stroke, sw = 1, rx = 0) => {
    const s = stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : '';
    const r = rx ? ` rx="${len(rx)}"` : '';
    return `<rect x="${px(x)}" y="${py(y)}" width="${len(w)}" height="${len(h)}" fill="${fill}"${s}${r}/>`;
  };
  const circle = (cx, cy, r, fill) =>
    `<circle cx="${px(cx)}" cy="${py(cy)}" r="${len(r)}" fill="${fill}"/>`;
  const poly = (points, fill, stroke, sw = 1) => {
    const pts = points.map(([x, y]) => `${px(x)},${py(y)}`).join(' ');
    const s = stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : '';
    return `<polygon points="${pts}" fill="${fill}"${s}/>`;
  };
  const star = (cx, cy, outer, inner, fill) => {
    const pts = [];
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? outer : inner;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return poly(pts, fill);
  };
  const dice = (qx, qy, color) => {
    let s = rect(qx + 0.6, qy + 0.6, 4.8, 4.8, COL.white, null, 0, 0.7);
    const a = 1.75;
    const b = 4.25;
    for (const [u, v] of [[a, a], [b, a], [a, b], [b, b]]) s += circle(qx + u, qy + v, 0.72, color);
    return s;
  };

  let s = '';
  s += rect(0, 0, 15, 15, COL.white);
  s += rect(0, 0, 6, 6, COL.green);
  s += rect(9, 0, 6, 6, COL.yellow);
  s += rect(0, 9, 6, 6, COL.red);
  s += rect(9, 9, 6, 6, COL.blue);
  s += dice(0, 0, COL.green);
  s += dice(9, 0, COL.yellow);
  s += dice(0, 9, COL.red);
  s += dice(9, 9, COL.blue);

  for (let col = 0; col < 15; col += 1) {
    for (let row = 0; row < 15; row += 1) {
      const vertical = col >= 6 && col <= 8;
      const horizontal = row >= 6 && row <= 8;
      if (!vertical && !horizontal) continue;
      if (vertical && horizontal) continue;
      s += rect(col, row, 1, 1, COL.white, COL.grid, 1.2);
    }
  }
  for (let r = 1; r <= 5; r += 1) s += rect(7, r, 1, 1, COL.yellow, COL.grid, 1.2);
  for (let r = 9; r <= 13; r += 1) s += rect(7, r, 1, 1, COL.red, COL.grid, 1.2);
  for (let c = 1; c <= 5; c += 1) s += rect(c, 7, 1, 1, COL.green, COL.grid, 1.2);
  for (let c = 9; c <= 13; c += 1) s += rect(c, 7, 1, 1, COL.blue, COL.grid, 1.2);

  s += rect(1, 6, 1, 1, COL.green, COL.grid, 1.2);
  s += rect(8, 1, 1, 1, COL.yellow, COL.grid, 1.2);
  s += rect(13, 8, 1, 1, COL.blue, COL.grid, 1.2);
  s += rect(6, 13, 1, 1, COL.red, COL.grid, 1.2);

  s += poly([[6, 6], [9, 6], [7.5, 7.5]], COL.yellow, COL.grid, 1.2);
  s += poly([[9, 6], [9, 9], [7.5, 7.5]], COL.blue, COL.grid, 1.2);
  s += poly([[9, 9], [6, 9], [7.5, 7.5]], COL.red, COL.grid, 1.2);
  s += poly([[6, 9], [6, 6], [7.5, 7.5]], COL.green, COL.grid, 1.2);

  s += poly([[7.25, 0.15], [7.75, 0.15], [7.5, 0.8]], COL.yellow);
  s += poly([[7.25, 14.85], [7.75, 14.85], [7.5, 14.2]], COL.red);
  s += poly([[0.15, 7.25], [0.15, 7.75], [0.8, 7.5]], COL.green);
  s += poly([[14.85, 7.25], [14.85, 7.75], [14.2, 7.5]], COL.blue);

  for (const [c, r] of [[2, 6], [8, 2], [12, 8], [6, 12]]) {
    s += star(c + 0.5, r + 0.5, 0.34, 0.15, COL.star);
  }
  return s;
}

module.exports = { boardArt, COL };
