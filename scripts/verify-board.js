/* eslint-disable */
// Renders the real board geometry + tokens to verify they sit centred on cells.
const path = require('path');
const sharp = require('sharp');

const RING = [
  [6,1],[6,2],[6,3],[6,4],[6,5],[5,6],[4,6],[3,6],[2,6],[1,6],[0,6],[0,7],
  [0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,9],[6,10],[6,11],[6,12],[6,13],[6,14],
  [7,14],[8,14],[8,13],[8,12],[8,11],[8,10],[8,9],[9,8],[10,8],[11,8],[12,8],[13,8],
  [14,8],[14,7],[14,6],[13,6],[12,6],[11,6],[10,6],[9,6],[8,5],[8,4],[8,3],[8,2],
  [8,1],[8,0],[7,0],[6,0],
];
const HOME = {
  red:[[7,1],[7,2],[7,3],[7,4],[7,5],[7,6]],
  green:[[1,7],[2,7],[3,7],[4,7],[5,7],[6,7]],
  yellow:[[7,13],[7,12],[7,11],[7,10],[7,9],[7,8]],
  blue:[[13,7],[12,7],[11,7],[10,7],[9,7],[8,7]],
};
const SLOTS = {
  red:[[1.3,1.3],[1.3,3.7],[3.7,1.3],[3.7,3.7]],
  green:[[1.3,10.3],[1.3,12.7],[3.7,10.3],[3.7,12.7]],
  yellow:[[10.3,10.3],[10.3,12.7],[12.7,10.3],[12.7,12.7]],
  blue:[[10.3,1.3],[10.3,3.7],[12.7,1.3],[12.7,3.7]],
};
const QUAD = { red:[0,0], green:[0,9], yellow:[9,9], blue:[9,0] };
const ENTRY = { red:0, green:13, yellow:26, blue:39 };
const HEX = { red:'#E53935', green:'#2FA84F', yellow:'#F4B400', blue:'#2A7FE0' };
const COLORS = ['red','green','yellow','blue'];

function coord(color, pos) {
  if (pos <= 50) { const r = (ENTRY[color] + pos) % 52; return RING[r]; }
  return HOME[color][Math.min(pos, 56) - 51];
}

const N = 15, S = 600, C = S / N;
const cx = (c) => (c + 0.5) * C;

let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${S}" height="${S}">`;
s += `<rect width="${S}" height="${S}" fill="#fff"/>`;
for (const col of COLORS) {
  const [qr, qc] = QUAD[col];
  s += `<rect x="${qc*C}" y="${qr*C}" width="${6*C}" height="${6*C}" fill="${HEX[col]}"/>`;
  s += `<rect x="${(qc+1)*C}" y="${(qr+1)*C}" width="${4*C}" height="${4*C}" fill="#fff"/>`;
  for (const [r,c] of SLOTS[col]) s += `<circle cx="${cx(c)}" cy="${cx(r)}" r="${C*0.38}" fill="none" stroke="${HEX[col]}" stroke-width="2"/>`;
}
RING.forEach(([r,c],i)=>{
  const start = Object.entries(ENTRY).find(([,v])=>v===i);
  s += `<rect x="${c*C}" y="${r*C}" width="${C}" height="${C}" fill="${start?HEX[start[0]]:'#fff'}" stroke="#C7CDD6"/>`;
});
for (const col of COLORS) for (const [r,c] of HOME[col]) s += `<rect x="${c*C}" y="${r*C}" width="${C}" height="${C}" fill="${HEX[col]}" stroke="#C7CDD6"/>`;

// Tokens: all in base, plus a few placed on track/home to check both.
const tokens = [];
for (const col of COLORS) for (let i=0;i<4;i++) tokens.push({col, base:true, slot:i});
const place = [['red',0],['red',8],['red',54],['green',0],['yellow',0],['blue',0],['blue',13]];
place.forEach(([col,pos],k)=>{ const t = tokens.find(t=>t.col===col && t.base); if(t){t.base=false; t.pos=pos;} });

const W = C*0.64, H = C*0.96, rH = W/2;
const pin = `M ${W/2},${H} C ${W*0.06},${H*0.6} 0,${rH+W*0.12} 0,${rH} A ${rH},${rH} 0 1 1 ${W},${rH} C ${W},${rH+W*0.12} ${W*0.94},${H*0.6} ${W/2},${H} Z`;
for (const t of tokens) {
  const [r,c] = t.base ? SLOTS[t.col][t.slot] : coord(t.col, t.pos);
  const x = cx(c) - W/2, y = cx(r) - H/2; // box centred on cell
  s += `<g transform="translate(${x},${y})">`;
  s += `<path d="${pin}" fill="${HEX[t.col]}" stroke="#fff" stroke-width="2"/>`;
  s += `<circle cx="${W/2}" cy="${rH}" r="${W*0.22}" fill="#fff"/>`;
  s += `</g>`;
  s += `<circle cx="${cx(c)}" cy="${cx(r)}" r="2" fill="#000"/>`; // cell centre dot
}
s += `</svg>`;

sharp(Buffer.from(s)).png().toFile(path.join(__dirname,'..','assets','_verify.png')).then(()=>console.log('ok'));
