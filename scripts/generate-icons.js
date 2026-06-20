/* eslint-disable */
/**
 * Generates the app icon assets from a single vector definition of the classic
 * four-quadrant Ludo board, then rasterizes them with sharp.
 *
 * Adaptive-icon strategy: the four dice are inset well within each quadrant, so
 * a launcher's circle/squircle mask only ever trims solid colour at the corners
 * — the dice (the recognisable subject) are always fully visible.
 *
 * Run: node scripts/generate-icons.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const N = 15;
const SIZE = 1024;
const C = SIZE / N; // px per cell

// Google-ish flat palette to match the reference art.
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

const p = (v) => (v * C).toFixed(2);

function rect(x, y, w, h, fill, stroke, sw = 1, rx = 0) {
  const s = stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : '';
  const r = rx ? ` rx="${p(rx)}"` : '';
  return `<rect x="${p(x)}" y="${p(y)}" width="${p(w)}" height="${p(h)}" fill="${fill}"${s}${r}/>`;
}
function circle(cx, cy, r, fill) {
  return `<circle cx="${p(cx)}" cy="${p(cy)}" r="${p(r)}" fill="${fill}"/>`;
}
function poly(points, fill, stroke, sw = 1) {
  const pts = points.map(([x, y]) => `${p(x)},${p(y)}`).join(' ');
  const s = stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : '';
  return `<polygon points="${pts}" fill="${fill}"${s}/>`;
}
function star(cx, cy, outer, inner, fill) {
  const pts = [];
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return poly(pts, fill);
}

function diceQuadrant(qx, qy, color) {
  let s = '';
  // White rounded face inset from the quadrant edges (keeps pips mask-safe).
  s += rect(qx + 0.6, qy + 0.6, 4.8, 4.8, COL.white, null, 0, 0.7);
  const a = 1.75;
  const b = 4.25;
  const r = 0.72;
  for (const [ox, oy] of [[a, a], [b, a], [a, b], [b, b]]) {
    s += circle(qx + ox, qy + oy, r, color);
  }
  return s;
}

function buildBoardSvg() {
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">`;

  // Base + quadrants.
  s += rect(0, 0, N, N, COL.white);
  s += rect(0, 0, 6, 6, COL.green);
  s += rect(9, 0, 6, 6, COL.yellow);
  s += rect(0, 9, 6, 6, COL.red);
  s += rect(9, 9, 6, 6, COL.blue);

  // Dice.
  s += diceQuadrant(0, 0, COL.green);
  s += diceQuadrant(9, 0, COL.yellow);
  s += diceQuadrant(0, 9, COL.red);
  s += diceQuadrant(9, 9, COL.blue);

  // White track cells (the cross), excluding the centre 3x3 pinwheel.
  for (let col = 0; col < N; col += 1) {
    for (let row = 0; row < N; row += 1) {
      const vertical = col >= 6 && col <= 8;
      const horizontal = row >= 6 && row <= 8;
      if (!vertical && !horizontal) continue;
      if (vertical && horizontal) continue; // centre handled separately
      s += rect(col, row, 1, 1, COL.white, COL.grid, 1.2);
    }
  }

  // Coloured home columns (5 cells each).
  for (let r = 1; r <= 5; r += 1) s += rect(7, r, 1, 1, COL.yellow, COL.grid, 1.2);
  for (let r = 9; r <= 13; r += 1) s += rect(7, r, 1, 1, COL.red, COL.grid, 1.2);
  for (let c = 1; c <= 5; c += 1) s += rect(c, 7, 1, 1, COL.green, COL.grid, 1.2);
  for (let c = 9; c <= 13; c += 1) s += rect(c, 7, 1, 1, COL.blue, COL.grid, 1.2);

  // Start cells.
  s += rect(1, 6, 1, 1, COL.green, COL.grid, 1.2);
  s += rect(8, 1, 1, 1, COL.yellow, COL.grid, 1.2);
  s += rect(13, 8, 1, 1, COL.blue, COL.grid, 1.2);
  s += rect(6, 13, 1, 1, COL.red, COL.grid, 1.2);

  // Centre pinwheel.
  s += poly([[6, 6], [9, 6], [7.5, 7.5]], COL.yellow, COL.grid, 1.2);
  s += poly([[9, 6], [9, 9], [7.5, 7.5]], COL.blue, COL.grid, 1.2);
  s += poly([[9, 9], [6, 9], [7.5, 7.5]], COL.red, COL.grid, 1.2);
  s += poly([[6, 9], [6, 6], [7.5, 7.5]], COL.green, COL.grid, 1.2);

  // Entry arrows.
  s += poly([[7.25, 0.15], [7.75, 0.15], [7.5, 0.8]], COL.yellow);
  s += poly([[7.25, 14.85], [7.75, 14.85], [7.5, 14.2]], COL.red);
  s += poly([[0.15, 7.25], [0.15, 7.75], [0.8, 7.5]], COL.green);
  s += poly([[14.85, 7.25], [14.85, 7.75], [14.2, 7.5]], COL.blue);

  // Safe-cell stars (one per arm).
  for (const [c, r] of [[2, 6], [8, 2], [12, 8], [6, 12]]) {
    s += star(c + 0.5, r + 0.5, 0.34, 0.15, COL.star);
  }

  // Subtle outer frame.
  s += rect(0.1, 0.1, N - 0.2, N - 0.2, 'none', COL.border, 2, 0.4);

  s += '</svg>';
  return s;
}

async function main() {
  const assets = path.join(__dirname, '..', 'assets');
  const svg = Buffer.from(buildBoardSvg());

  // Foreground (adaptive) + iOS/legacy icon + splash = the board.
  await sharp(svg).png().toFile(path.join(assets, 'android-icon-foreground.png'));
  await sharp(svg).png().toFile(path.join(assets, 'icon.png'));
  await sharp(svg).png().toFile(path.join(assets, 'splash-icon.png'));
  await sharp(svg).resize(196, 196).png().toFile(path.join(assets, 'favicon.png'));

  // Background layer: solid white (only shows via launcher parallax).
  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .png()
    .toFile(path.join(assets, 'android-icon-background.png'));

  // eslint-disable-next-line no-console
  console.log('Icons generated in', assets);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
