/* eslint-disable */
/**
 * Generates the launcher icon assets from the shared Ludo board art.
 * Run: node scripts/generate-icons.js
 */
const path = require('path');
const sharp = require('sharp');
const { boardArt, COL } = require('./board-art');

const SIZE = 1024;

function iconSvg() {
  const C = SIZE / 15;
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">` +
    boardArt(0, 0, SIZE) +
    `<rect x="${(0.1 * C).toFixed(2)}" y="${(0.1 * C).toFixed(2)}" width="${(14.8 * C).toFixed(2)}" height="${(14.8 * C).toFixed(2)}" fill="none" stroke="${COL.border}" stroke-width="2" rx="${(0.4 * C).toFixed(2)}"/>` +
    `</svg>`
  );
}

async function main() {
  const assets = path.join(__dirname, '..', 'assets');
  const svg = Buffer.from(iconSvg());

  await sharp(svg).png().toFile(path.join(assets, 'android-icon-foreground.png'));
  await sharp(svg).png().toFile(path.join(assets, 'icon.png'));
  await sharp(svg).resize(196, 196).png().toFile(path.join(assets, 'favicon.png'));
  await sharp({
    create: { width: SIZE, height: SIZE, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .png()
    .toFile(path.join(assets, 'android-icon-background.png'));

  console.log('Icons generated in', assets);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
