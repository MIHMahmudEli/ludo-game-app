/* eslint-disable */
/**
 * Generates a classic splash logo: a gold double-framed Ludo board medallion
 * with a serif "LUDO" wordmark and "CLASSIC" subtitle, on a transparent canvas
 * (Expo paints the felt-green background behind it).
 *
 * Run: node scripts/generate-splash.js
 */
const path = require('path');
const sharp = require('sharp');
const { boardArt } = require('./board-art');

const W = 1200;
const H = 1700;

// Board medallion geometry.
const SB = 720;
const BX = (W - SB) / 2;
const BY = 300;
const FP = 34; // gold frame padding

const GOLD_LIGHT = '#F3D98B';
const GOLD = '#D4AF37';
const GOLD_DARK = '#8A6D1F';
const CREAM = '#F7EFD9';

function diamond(cx, cy, r) {
  return `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${GOLD}"/>`;
}

function splashSvg() {
  const titleY = BY + SB + FP + 230;
  const subY = titleY + 110;
  const dotsY = subY + 96;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${GOLD_LIGHT}"/>
      <stop offset="0.5" stop-color="${GOLD}"/>
      <stop offset="1" stop-color="${GOLD_DARK}"/>
    </linearGradient>
    <clipPath id="boardClip">
      <rect x="${BX}" y="${BY}" width="${SB}" height="${SB}" rx="28"/>
    </clipPath>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="18"/>
      <feOffset dx="0" dy="14" result="off"/>
      <feComponentTransfer><feFuncA type="linear" slope="0.45"/></feComponentTransfer>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Gold double frame + board -->
  <g filter="url(#softShadow)">
    <rect x="${BX - FP}" y="${BY - FP}" width="${SB + FP * 2}" height="${SB + FP * 2}" rx="48" fill="url(#gold)"/>
  </g>
  <rect x="${BX - FP + 10}" y="${BY - FP + 10}" width="${SB + FP * 2 - 20}" height="${SB + FP * 2 - 20}" rx="40" fill="none" stroke="${GOLD_DARK}" stroke-width="3"/>
  <g clip-path="url(#boardClip)">${boardArt(BX, BY, SB)}</g>
  <rect x="${BX}" y="${BY}" width="${SB}" height="${SB}" rx="28" fill="none" stroke="${GOLD_DARK}" stroke-width="4"/>

  <!-- Wordmark -->
  <text x="${W / 2}" y="${titleY}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="240" font-weight="bold"
        fill="${CREAM}" stroke="${GOLD}" stroke-width="3" letter-spacing="6">LUDO</text>

  <!-- Subtitle with flourishes -->
  ${diamond(W / 2 - 250, subY - 22, 12)}
  <line x1="${W / 2 - 230}" y1="${subY - 22}" x2="${W / 2 - 150}" y2="${subY - 22}" stroke="${GOLD}" stroke-width="3"/>
  <text x="${W / 2}" y="${subY}" text-anchor="middle"
        font-family="Georgia, 'Times New Roman', serif" font-size="62" fill="${GOLD_LIGHT}" letter-spacing="18">CLASSIC</text>
  <line x1="${W / 2 + 150}" y1="${subY - 22}" x2="${W / 2 + 230}" y2="${subY - 22}" stroke="${GOLD}" stroke-width="3"/>
  ${diamond(W / 2 + 250, subY - 22, 12)}

  <!-- Player colour dots -->
  ${[['#34A853', -90], ['#FBBC04', -30], ['#EA4335', 30], ['#4285F4', 90]]
    .map(([c, dx]) => `<circle cx="${W / 2 + dx}" cy="${dotsY}" r="20" fill="${c}"/>`)
    .join('')}
</svg>`;
}

async function main() {
  const assets = path.join(__dirname, '..', 'assets');
  await sharp(Buffer.from(splashSvg())).png().toFile(path.join(assets, 'splash-icon.png'));
  console.log('Splash generated in', assets);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
