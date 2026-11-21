// Scene painters for Twin Frames. Each scene paints the same 600x400 picture
// twice: variant 0 is the ORIGINAL panel, variant 1 is the TWIN panel. The
// only differences between the two are the ones listed in `differences` —
// every other stroke is identical, drawn from the same seeded rng.
import { makeRng, sceneSeed } from './random.js';

export const PANEL_W = 600;
export const PANEL_H = 400;

function sky(ctx, top, bottom, h = PANEL_H) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, PANEL_W, h);
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function rect(ctx, x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

function poly(ctx, points, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function cloud(ctx, x, y, s, fill = 'rgba(255,255,255,0.92)') {
  ellipse(ctx, x, y, 34 * s, 15 * s, fill);
  ellipse(ctx, x - 22 * s, y + 5 * s, 22 * s, 11 * s, fill);
  ellipse(ctx, x + 24 * s, y + 5 * s, 24 * s, 12 * s, fill);
}

function gull(ctx, x, y, s = 1, stroke = '#3a3230') {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.2 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 11 * s, y);
  ctx.quadraticCurveTo(x - 5 * s, y - 7 * s, x, y);
  ctx.quadraticCurveTo(x + 5 * s, y - 7 * s, x + 11 * s, y);
  ctx.stroke();
}

function waveLine(ctx, y, amp, color, phase) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= PANEL_W; x += 8) {
    const yy = y + Math.sin(x / 34 + phase) * amp;
    if (x === 0) ctx.moveTo(x, yy);
    else ctx.lineTo(x, yy);
  }
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// Scene 1 — Harbor Dawn. Differences: sun rays, a gull, the sailboat flag,
// the lighthouse beam, a crate, the buoy's stripe, the cottage window.
// ---------------------------------------------------------------------------
function drawHarbor(ctx, variant) {
  const rng = makeRng(sceneSeed('harbor'));
  sky(ctx, '#ffd9a0', '#bfe0ea', 250);
  // Sun, top-left. Twin loses its rays.
  circle(ctx, 110, 70, 30, '#ffcf4d');
  circle(ctx, 110, 70, 22, '#ffe08a');
  if (variant === 0) {
    ctx.strokeStyle = '#ffcf4d';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(110 + Math.cos(a) * 36, 70 + Math.sin(a) * 36);
      ctx.lineTo(110 + Math.cos(a) * 48, 70 + Math.sin(a) * 48);
      ctx.stroke();
    }
  }
  cloud(ctx, 235, 58, 1);
  cloud(ctx, 430, 42, 0.8);
  cloud(ctx, 520, 92, 0.6);
  // Gulls: the middle one only flies in the original.
  gull(ctx, 268, 92, 0.9);
  gull(ctx, 352, 70, 1);
  if (variant === 0) gull(ctx, 305, 108, 0.85);

  // Distant headland.
  poly(ctx, [[0, 250], [60, 205], [150, 250]], '#7ba05b');
  circle(ctx, 62, 208, 12, '#5d7f43');
  circle(ctx, 96, 214, 9, '#5d7f43');

  // Sea.
  const sea = ctx.createLinearGradient(0, 250, 0, PANEL_H);
  sea.addColorStop(0, '#3d8fa3');
  sea.addColorStop(1, '#155e6b');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 250, PANEL_W, 150);
  waveLine(ctx, 272, 3, 'rgba(255,255,255,0.35)', 0);
  waveLine(ctx, 300, 4, 'rgba(255,255,255,0.28)', 1.7);
  waveLine(ctx, 340, 4, 'rgba(255,255,255,0.22)', 3.1);
  waveLine(ctx, 378, 3, 'rgba(255,255,255,0.18)', 4.4);

  // Cottage on the headland, left. Its window glows only in the original.
  rect(ctx, 58, 196, 74, 54, '#f3e2c2');
  poly(ctx, [[50, 198], [95, 168], [140, 198]], '#b3402e');
  rect(ctx, 88, 222, 16, 28, '#7a4a2b');
  ctx.fillStyle = variant === 0 ? '#ffd94d' : '#4a3a30';
  ctx.fillRect(66, 208, 14, 14);
  ctx.fillRect(112, 208, 14, 14);
  ctx.strokeStyle = '#7a4a2b';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(66, 208, 14, 14);
  ctx.strokeRect(112, 208, 14, 14);

  // Lighthouse, right. Its beam sweeps only in the original.
  if (variant === 0) {
    const beam = ctx.createLinearGradient(520, 118, 330, 150);
    beam.addColorStop(0, 'rgba(255,240,170,0.55)');
    beam.addColorStop(1, 'rgba(255,240,170,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(520, 108);
    ctx.lineTo(330, 138);
    ctx.lineTo(330, 168);
    ctx.lineTo(520, 130);
    ctx.closePath();
    ctx.fill();
  }
  poly(ctx, [[498, 252], [506, 118], [538, 118], [546, 252]], '#f6ead2');
  rect(ctx, 500, 176, 44, 20, '#b3402e');
  rect(ctx, 503, 222, 38, 18, '#b3402e');
  rect(ctx, 502, 100, 40, 20, '#2b2118');
  circle(ctx, 522, 110, 9, variant === 0 ? '#fff3b0' : '#8a7a5a');
  rect(ctx, 494, 118, 56, 5, '#2b2118');
  rect(ctx, 516, 84, 12, 18, '#2b2118');
  circle(ctx, 522, 82, 6, '#b3402e');
  // Rocky base.
  poly(ctx, [[488, 252], [522, 238], [556, 252]], '#8d8578');
  poly(ctx, [[470, 252], [500, 244], [522, 252]], '#7a7264');

  // Pier with crates, bottom-left. The twin is one crate short.
  rect(ctx, 30, 306, 250, 10, '#8a6a44');
  rect(ctx, 30, 316, 250, 8, '#77582f');
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(40 + i * 48, 306);
    ctx.lineTo(40 + i * 48, 324);
    ctx.stroke();
  }
  rect(ctx, 52, 316, 10, 84, '#6b4e2e');
  rect(ctx, 252, 316, 10, 84, '#6b4e2e');
  rect(ctx, 128, 282, 26, 24, '#c08a2d');
  rect(ctx, 156, 282, 26, 24, '#a87c22');
  rect(ctx, 142, 258, 26, 24, '#c08a2d');
  ctx.strokeStyle = '#7a5a14';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(128, 282, 26, 24);
  ctx.strokeRect(156, 282, 26, 24);
  ctx.strokeRect(142, 258, 26, 24);
  if (variant === 0) {
    rect(ctx, 184, 282, 26, 24, '#c08a2d');
    ctx.strokeRect(184, 282, 26, 24);
  }

  // Sailboat mid-sea. Its flag is red in the original, teal in the twin.
  poly(ctx, [[368, 300], [404, 300], [398, 272], [374, 272]], '#7a3b2e');
  rect(ctx, 384, 178, 5, 96, '#5d2f24');
  poly(ctx, [[391, 186], [391, 268], [436, 268]], '#fbf3dd');
  poly(ctx, [[381, 196], [381, 268], [350, 268]], '#efe0bd');
  poly(ctx, [[389, 178], [414, 186], [389, 194]], variant === 0 ? '#b3402e' : '#1f6f6b');
  ellipse(ctx, 386, 306, 26, 5, 'rgba(255,255,255,0.35)');

  // Buoy: striped in the original, plain in the twin.
  ellipse(ctx, 470, 322, 20, 6, 'rgba(255,255,255,0.3)');
  circle(ctx, 470, 306, 13, '#e2574c');
  if (variant === 0) {
    ctx.fillStyle = '#f6ead2';
    ctx.fillRect(458, 302, 24, 7);
  }
  rect(ctx, 467, 288, 6, 8, '#7a3b2e');
  circle(ctx, 470, 286, 3, '#ffd94d');

  // A fish jumps in both pictures — decoration, not a difference.
  ctx.strokeStyle = '#eaf6f6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(250, 352, 10, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  poly(ctx, [[241, 344], [250, 336], [256, 345]], '#eaf6f6');
  void rng;
}

const HARBOR_DIFFS = [
  { id: 'sun-rays', name: 'Sun rays', x: 110, y: 70, r: 30, hint: 'Look at the sun — one picture has rays, the other does not.' },
  { id: 'gull', name: 'Middle gull', x: 305, y: 108, r: 24, hint: 'Count the gulls in the sky.' },
  { id: 'flag', name: 'Sailboat flag', x: 400, y: 186, r: 22, hint: 'The little boat flies a flag — what colour is it?' },
  { id: 'beam', name: 'Lighthouse beam', x: 420, y: 140, r: 30, hint: 'Does the lighthouse light reach across the water?' },
  { id: 'crate', name: 'Third crate', x: 197, y: 294, r: 24, hint: 'Count the crates stacked on the pier.' },
  { id: 'buoy', name: 'Buoy stripe', x: 470, y: 306, r: 24, hint: 'The red buoy wears a stripe in one picture only.' },
  { id: 'window', name: 'Cottage window', x: 119, y: 215, r: 22, hint: 'Is someone home in the little cottage?' },
];

// ---------------------------------------------------------------------------
// Scene 2 — Enchanted Garden. Differences: butterfly colour, a mushroom, a
// tulip's colour, a bee, the pond duck, the lantern's glow, a snail.
// ---------------------------------------------------------------------------
function drawGarden(ctx, variant) {
  const rng = makeRng(sceneSeed('garden'));
  sky(ctx, '#d8f0c8', '#fdf6d8', 200);
  circle(ctx, 512, 62, 26, '#ffdf6b');
  circle(ctx, 512, 62, 18, '#ffec9e');
  cloud(ctx, 150, 52, 0.9);
  cloud(ctx, 360, 40, 0.7);

  // Lawn.
  const lawn = ctx.createLinearGradient(0, 180, 0, PANEL_H);
  lawn.addColorStop(0, '#8fc25e');
  lawn.addColorStop(1, '#5d8f3e');
  ctx.fillStyle = lawn;
  ctx.fillRect(0, 180, PANEL_W, 220);
  // Scattered grass tufts and daisies, identical in both pictures.
  for (let i = 0; i < 46; i++) {
    const x = 8 + rng() * 584;
    const y = 196 + rng() * 196;
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 3, y - 6);
    ctx.moveTo(x + 3, y);
    ctx.lineTo(x + 5, y - 5);
    ctx.stroke();
  }
  for (let i = 0; i < 12; i++) {
    const x = 20 + rng() * 560;
    const y = 210 + rng() * 170;
    circle(ctx, x, y, 4, '#ffffff');
    circle(ctx, x, y, 2, '#ffd94d');
  }

  // Big tree, left.
  rect(ctx, 52, 150, 22, 110, '#7a4a2b');
  circle(ctx, 62, 128, 46, '#4d7a35');
  circle(ctx, 30, 148, 28, '#5d8f3e');
  circle(ctx, 96, 146, 30, '#5d8f3e');
  circle(ctx, 62, 104, 26, '#6a9c46');
  circle(ctx, 40, 116, 7, '#ff8fa3');
  circle(ctx, 84, 132, 7, '#ff8fa3');
  circle(ctx, 62, 148, 6, '#ff8fa3');

  // Stone path to the fountain.
  for (let i = 0; i < 6; i++) {
    ellipse(ctx, 300 + (i % 2 === 0 ? -14 : 16), 392 - i * 22, 26, 8, '#e8dcc0');
  }

  // Fountain and pond, right.
  ellipse(ctx, 468, 316, 96, 30, '#7ec8d8');
  ellipse(ctx, 468, 314, 84, 24, '#a5dcec');
  rect(ctx, 458, 258, 20, 52, '#cfc4a8');
  ellipse(ctx, 468, 258, 34, 10, '#e8dcc0');
  ellipse(ctx, 468, 256, 26, 7, '#a5dcec');
  ctx.strokeStyle = '#a5dcec';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(468, 236, 20, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(448, 262, 14, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(488, 262, 14, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  // The duck swims only in the original.
  if (variant === 0) {
    ellipse(ctx, 512, 312, 14, 9, '#ffffff');
    circle(ctx, 522, 303, 7, '#ffffff');
    poly(ctx, [[528, 303], [534, 305], [528, 307]], '#f39c12');
    circle(ctx, 524, 301, 1.6, '#2b2118');
  }

  // Lantern post, far right. Lit in the original, dark in the twin.
  rect(ctx, 548, 150, 6, 130, '#3a3230');
  poly(ctx, [[540, 150], [562, 150], [556, 138], [546, 138]], '#3a3230');
  if (variant === 0) {
    const glow = ctx.createRadialGradient(551, 168, 4, 551, 168, 42);
    glow.addColorStop(0, 'rgba(255,214,90,0.75)');
    glow.addColorStop(1, 'rgba(255,214,90,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(505, 122, 92, 92);
  }
  rect(ctx, 543, 156, 16, 22, variant === 0 ? '#ffd94d' : '#6b5a44');
  ctx.strokeStyle = '#3a3230';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(543, 156, 16, 22);

  // Flower bed along the bottom: the tulip at (300, 300) changes colour.
  const tulips = [
    [60, 352, '#e2574c'], [120, 368, '#ff8fa3'], [180, 352, '#e2574c'],
    [240, 368, '#c77dff'], [360, 368, '#e2574c'], [420, 352, '#ff8fa3'],
    [480, 372, '#c77dff'], [540, 356, '#e2574c'],
  ];
  for (const [x, y, c] of tulips) {
    ctx.strokeStyle = '#3d7a2e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 22);
    ctx.stroke();
    circle(ctx, x, y - 26, 8, c);
    ellipse(ctx, x - 6, y - 18, 6, 3, '#4d7a35');
  }
  ctx.strokeStyle = '#3d7a2e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(300, 326);
  ctx.lineTo(300, 304);
  ctx.stroke();
  circle(ctx, 300, 300, 9, variant === 0 ? '#e2574c' : '#ffd94d');
  ellipse(ctx, 294, 312, 6, 3, '#4d7a35');

  // Mushroom cluster, bottom-left. The twin is one mushroom short.
  ellipse(ctx, 92, 336, 26, 6, '#3d7a2e');
  rect(ctx, 78, 316, 10, 20, '#f6ead2');
  poly(ctx, [[68, 318], [98, 318], [83, 300]], '#e2574c');
  circle(ctx, 80, 310, 2.5, '#fff');
  circle(ctx, 88, 306, 2, '#fff');
  rect(ctx, 102, 322, 8, 14, '#f6ead2');
  poly(ctx, [[94, 324], [118, 324], [106, 310]], '#e2574c');
  if (variant === 0) {
    rect(ctx, 58, 324, 7, 12, '#f6ead2');
    poly(ctx, [[51, 326], [72, 326], [61, 314]], '#e2574c');
  }

  // The snail crawls only in the original.
  if (variant === 0) {
    ellipse(ctx, 152, 366, 12, 7, '#8a6a44');
    circle(ctx, 146, 356, 9, '#c08a2d');
    circle(ctx, 142, 348, 2, '#2b2118');
    ctx.strokeStyle = '#8a6a44';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(146, 356, 5, 0, Math.PI * 1.5);
    ctx.stroke();
  }

  // Butterfly, top-right. Orange in the original, blue in the twin.
  const wing = variant === 0 ? '#ff8c42' : '#4d9de0';
  ellipse(ctx, 424, 106, 12, 8, wing);
  ellipse(ctx, 438, 106, 12, 8, wing);
  ellipse(ctx, 426, 116, 8, 6, variant === 0 ? '#e2574c' : '#2f6fb0');
  ellipse(ctx, 436, 116, 8, 6, variant === 0 ? '#e2574c' : '#2f6fb0');
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(431, 100);
  ctx.lineTo(431, 120);
  ctx.stroke();

  // The bee buzzes only in the original.
  if (variant === 0) {
    ellipse(ctx, 200, 150, 9, 6, '#ffd94d');
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(197, 145);
    ctx.lineTo(197, 155);
    ctx.moveTo(203, 145);
    ctx.lineTo(203, 155);
    ctx.stroke();
    ellipse(ctx, 194, 143, 6, 4, 'rgba(255,255,255,0.85)');
  }
}

const GARDEN_DIFFS = [
  { id: 'butterfly', name: 'Butterfly colour', x: 431, y: 108, r: 26, hint: 'The butterfly changed its wings.' },
  { id: 'mushroom', name: 'Little mushroom', x: 61, y: 320, r: 22, hint: 'Count the mushrooms by the tree.' },
  { id: 'tulip', name: 'Tulip colour', x: 300, y: 300, r: 22, hint: 'One tulip in the bottom bed is a different colour.' },
  { id: 'bee', name: 'Bee', x: 200, y: 150, r: 24, hint: 'Something is buzzing near the flowers.' },
  { id: 'duck', name: 'Pond duck', x: 514, y: 308, r: 26, hint: 'Is anyone swimming in the fountain pond?' },
  { id: 'lantern', name: 'Lantern glow', x: 551, y: 167, r: 26, hint: 'The garden lantern — lit or dark?' },
  { id: 'snail', name: 'Snail', x: 150, y: 360, r: 24, hint: 'Something slow crawls along the bottom edge.' },
];

// ---------------------------------------------------------------------------
// Scene 3 — The Old Library. Differences: the cat, the clock's hands, the
// teapot's steam, one book's spine, the globe's land, the painting's sky,
// the desk lamp's glow.
// ---------------------------------------------------------------------------
function drawLibrary(ctx, variant) {
  const rng = makeRng(sceneSeed('library'));
  // Walls and floor.
  rect(ctx, 0, 0, PANEL_W, 270, '#e3c99a');
  rect(ctx, 0, 270, PANEL_W, 6, '#8a6a44');
  const floor = ctx.createLinearGradient(0, 276, 0, PANEL_H);
  floor.addColorStop(0, '#a87c4f');
  floor.addColorStop(1, '#7a5426');
  ctx.fillStyle = floor;
  ctx.fillRect(0, 276, PANEL_W, 124);
  ctx.strokeStyle = 'rgba(0,0,0,0.18)';
  ctx.lineWidth = 1.5;
  for (let y = 300; y < 400; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(PANEL_W, y);
    ctx.stroke();
  }

  // Bookshelf, left wall.
  rect(ctx, 28, 56, 160, 220, '#6b4e2e');
  const shelfColors = ['#b3402e', '#1f6f6b', '#c08a2d', '#4d7a35', '#7a4a8a', '#2f6fb0'];
  for (let shelf = 0; shelf < 3; shelf++) {
    const y = 66 + shelf * 68;
    rect(ctx, 36, y, 144, 8, '#8a6a44');
    let x = 38;
    let i = 0;
    while (x < 172) {
      const w = 10 + Math.floor(rng() * 8);
      const h = 44 + Math.floor(rng() * 8);
      const color = shelfColors[(i + shelf) % shelfColors.length];
      rect(ctx, x, y - h + 4, w, h - 4, color);
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y - h + 4, w, h - 4);
      x += w + 2;
      i++;
    }
    rect(ctx, 36, y + 8, 144, 6, '#5d3f22');
  }
  // One book on the middle shelf changes its cover between pictures.
  rect(ctx, 90, 96, 14, 42, variant === 0 ? '#b3402e' : '#1f6f6b');
  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = 1;
  ctx.strokeRect(90, 96, 14, 42);
  ctx.fillStyle = '#f6ead2';
  ctx.fillRect(93, 112, 8, 3);
  // A leaning book on the top shelf, both pictures.
  ctx.save();
  ctx.translate(160, 66);
  ctx.rotate(0.35);
  rect(ctx, 0, -40, 12, 40, '#7a4a8a');
  ctx.restore();

  // Framed painting, centre. Moon in the original, sun in the twin.
  rect(ctx, 232, 96, 136, 92, '#2b2118');
  rect(ctx, 238, 102, 124, 80, '#7fb3d5');
  poly(ctx, [[238, 182], [290, 128], [330, 182]], '#5d8f3e');
  poly(ctx, [[300, 182], [336, 140], [362, 182]], '#4d7a35');
  if (variant === 0) {
    circle(ctx, 262, 122, 12, '#f6ead2');
    circle(ctx, 266, 120, 10, '#7fb3d5');
    circle(ctx, 322, 116, 2, '#fff');
    circle(ctx, 340, 128, 2, '#fff');
  } else {
    circle(ctx, 262, 122, 11, '#ffdf6b');
    ctx.strokeStyle = '#ffdf6b';
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(262 + Math.cos(a) * 15, 122 + Math.sin(a) * 15);
      ctx.lineTo(262 + Math.cos(a) * 20, 122 + Math.sin(a) * 20);
      ctx.stroke();
    }
  }

  // Wall clock above the painting. Its hands read 3:00 in one, 4:30 in the other.
  circle(ctx, 300, 62, 26, '#f6ead2');
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(300, 62, 26, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(300, 62);
  ctx.lineTo(300, 62 - 14);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(300, 62);
  if (variant === 0) ctx.lineTo(300 + 13, 62);
  else ctx.lineTo(300, 62 + 13);
  ctx.stroke();
  circle(ctx, 300, 62, 2.5, '#2b2118');

  // Rug.
  ellipse(ctx, 300, 372, 150, 20, '#a33d2e');
  ellipse(ctx, 300, 372, 118, 14, '#c08a2d');
  ellipse(ctx, 300, 372, 84, 9, '#a33d2e');

  // Side table with a teapot, bottom-left. Steam rises only in the original.
  rect(ctx, 196, 300, 70, 8, '#8a6a44');
  rect(ctx, 204, 308, 8, 62, '#6b4e2e');
  rect(ctx, 250, 308, 8, 62, '#6b4e2e');
  ellipse(ctx, 231, 292, 22, 12, '#1f6f6b');
  rect(ctx, 226, 272, 10, 8, '#155450');
  poly(ctx, [[253, 282], [264, 288], [253, 294]], '#1f6f6b');
  ctx.beginPath();
  ctx.arc(210, 288, 8, Math.PI * 0.5, Math.PI * 1.5);
  ctx.strokeStyle = '#1f6f6b';
  ctx.lineWidth = 3;
  ctx.stroke();
  if (variant === 0) {
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(228, 268);
    ctx.quadraticCurveTo(222, 256, 230, 246);
    ctx.quadraticCurveTo(236, 238, 230, 230);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(238, 268);
    ctx.quadraticCurveTo(244, 258, 238, 248);
    ctx.stroke();
  }

  // Armchair, right. A cat naps on it only in the original.
  poly(ctx, [[400, 370], [404, 300], [420, 288], [500, 288], [516, 300], [520, 370]], '#7a3b2e');
  rect(ctx, 396, 296, 128, 22, '#8a4436');
  ellipse(ctx, 460, 292, 60, 12, '#8a4436');
  rect(ctx, 402, 368, 12, 22, '#5d2f24');
  rect(ctx, 506, 368, 12, 22, '#5d2f24');
  if (variant === 0) {
    ellipse(ctx, 460, 282, 30, 12, '#e8a34c');
    circle(ctx, 486, 272, 11, '#e8a34c');
    poly(ctx, [[480, 262], [484, 254], [488, 262]], '#e8a34c');
    poly(ctx, [[492, 262], [496, 254], [498, 262]], '#e8a34c');
    ctx.strokeStyle = '#b97e2e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(486, 284, 8, 0.3, Math.PI - 0.3);
    ctx.stroke();
  }

  // Desk with globe and lamp, far right.
  rect(ctx, 528, 296, 62, 10, '#5d3f22');
  rect(ctx, 536, 306, 8, 64, '#4a3018');
  rect(ctx, 574, 306, 8, 64, '#4a3018');
  // Globe: the twin's world has no land.
  circle(ctx, 548, 268, 20, '#7fb3d5');
  if (variant === 0) {
    ellipse(ctx, 542, 262, 8, 5, '#5d8f3e');
    ellipse(ctx, 556, 276, 7, 4, '#5d8f3e');
    ellipse(ctx, 550, 254, 4, 3, '#5d8f3e');
  }
  ctx.strokeStyle = '#8a6a44';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(548, 268, 23, Math.PI * 1.15, Math.PI * 1.85);
  ctx.stroke();
  rect(ctx, 544, 290, 8, 8, '#8a6a44');
  // Lamp: glowing in the original, dark in the twin.
  if (variant === 0) {
    const glow = ctx.createRadialGradient(578, 268, 4, 578, 268, 46);
    glow.addColorStop(0, 'rgba(255,214,90,0.7)');
    glow.addColorStop(1, 'rgba(255,214,90,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(528, 218, 100, 100);
  }
  rect(ctx, 576, 282, 4, 16, '#2b2118');
  poly(ctx, [[566, 282], [590, 282], [584, 258], [572, 258]], variant === 0 ? '#ffd94d' : '#6b5a44');
  ellipse(ctx, 578, 300, 10, 3, '#2b2118');
  // Candle on the desk, burning in both pictures.
  rect(ctx, 534, 282, 6, 16, '#f6ead2');
  ellipse(ctx, 537, 278, 3, 5, '#ffcf4d');
  void rng;
}

const LIBRARY_DIFFS = [
  { id: 'cat', name: 'Sleeping cat', x: 462, y: 280, r: 28, hint: 'Something orange naps on the armchair — or does it?' },
  { id: 'clock', name: 'Clock hands', x: 300, y: 62, r: 28, hint: 'What time does the wall clock show?' },
  { id: 'steam', name: 'Teapot steam', x: 232, y: 250, r: 26, hint: 'Is the teapot still hot?' },
  { id: 'book', name: 'Book spine', x: 97, y: 117, r: 24, hint: 'One book on the middle shelf changed its cover.' },
  { id: 'globe', name: 'Globe land', x: 548, y: 268, r: 26, hint: 'Look closely at the little globe on the desk.' },
  { id: 'painting', name: 'Painting sky', x: 262, y: 122, r: 26, hint: 'Night or day in the framed painting?' },
  { id: 'lamp', name: 'Lamp glow', x: 578, y: 268, r: 26, hint: 'The desk lamp — on or off?' },
];

// ---------------------------------------------------------------------------
// Scene 4 — Night Market. Differences: the moon's phase, a lantern's colour,
// a kite, a balloon, the awning stripes, one star, the stall cat.
// ---------------------------------------------------------------------------
function drawMarket(ctx, variant) {
  const rng = makeRng(sceneSeed('market'));
  // Night sky.
  const night = ctx.createLinearGradient(0, 0, 0, 260);
  night.addColorStop(0, '#1b2a52');
  night.addColorStop(1, '#3d5a8a');
  ctx.fillStyle = night;
  ctx.fillRect(0, 0, PANEL_W, 260);
  // Stars, identical in both pictures — except one, high up.
  for (let i = 0; i < 60; i++) {
    const x = 10 + rng() * 580;
    const y = 10 + rng() * 200;
    const r = 1 + rng() * 1.6;
    circle(ctx, x, y, r, `rgba(255,255,255,${0.4 + rng() * 0.5})`);
  }
  if (variant === 0) {
    circle(ctx, 380, 58, 3, '#fff');
    circle(ctx, 376, 54, 1.2, '#fff');
    circle(ctx, 384, 54, 1.2, '#fff');
    circle(ctx, 376, 62, 1.2, '#fff');
    circle(ctx, 384, 62, 1.2, '#fff');
  }
  // Moon: full in the original, crescent in the twin.
  circle(ctx, 90, 70, 26, '#f6ead2');
  circle(ctx, 90, 70, 20, '#fdf6d8');
  if (variant === 1) {
    circle(ctx, 100, 64, 22, '#24365e');
  }
  // Kite, flying only in the original.
  if (variant === 0) {
    poly(ctx, [[480, 78], [498, 96], [480, 114], [462, 96]], '#e2574c');
    poly(ctx, [[480, 96], [498, 96], [480, 114]], '#ff8fa3');
    ctx.strokeStyle = '#f6ead2';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(480, 114);
    ctx.quadraticCurveTo(470, 130, 478, 146);
    ctx.stroke();
    poly(ctx, [[474, 128], [482, 128], [478, 136]], '#ffd94d');
  }
  // String lights across the sky.
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 120);
  ctx.quadraticCurveTo(300, 168, 600, 118);
  ctx.stroke();
  const bulbColors = ['#ffd94d', '#ff8fa3', '#7ec8d8', '#ff8c42'];
  for (let i = 0; i < 12; i++) {
    const t = (i + 0.5) / 12;
    const x = t * 600;
    const y = 120 + Math.sin(t * Math.PI) * 22 + (t < 0.5 ? t * 24 : (1 - t) * 20);
    circle(ctx, x, y + 8, 5, bulbColors[i % 4]);
  }

  // Ground: cobbled market square.
  rect(ctx, 0, 250, PANEL_W, 150, '#6b5a44');
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1.5;
  for (let y = 270; y < 400; y += 26) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(PANEL_W, y);
    ctx.stroke();
  }
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(60 + i * 70, 250);
    ctx.lineTo(40 + i * 70, 400);
    ctx.stroke();
  }

  // Hanging paper lanterns. The middle one is red in one picture, green in the other.
  function lantern(x, y, color) {
    ctx.strokeStyle = '#2b2118';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 42);
    ctx.lineTo(x, y - 14);
    ctx.stroke();
    ellipse(ctx, x, y, 16, 20, color);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, 16, 20, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x - 12, y - 12);
    ctx.lineTo(x + 12, y - 12);
    ctx.moveTo(x - 14, y);
    ctx.lineTo(x + 14, y);
    ctx.moveTo(x - 12, y + 12);
    ctx.lineTo(x + 12, y + 12);
    ctx.stroke();
    rect(ctx, x - 5, y + 20, 10, 4, '#c08a2d');
  }
  lantern(150, 168, '#e2574c');
  lantern(300, 162, variant === 0 ? '#e2574c' : '#4d7a35');
  lantern(450, 168, '#ff8c42');

  // Stall 1 (left): awning stripes red/white vs teal/white.
  rect(ctx, 60, 240, 140, 10, '#5d3f22');
  for (let i = 0; i < 7; i++) {
    rect(ctx, 60 + i * 20, 196, 20, 44, i % 2 === 0
      ? (variant === 0 ? '#b3402e' : '#1f6f6b')
      : '#f6ead2');
  }
  rect(ctx, 66, 240, 8, 110, '#7a4a2b');
  rect(ctx, 186, 240, 8, 110, '#7a4a2b');
  rect(ctx, 60, 240, 140, 12, '#8a6a44');
  // Fruit on the counter.
  circle(ctx, 90, 232, 7, '#e2574c');
  circle(ctx, 108, 232, 7, '#ff8c42');
  circle(ctx, 126, 232, 7, '#ffd94d');
  circle(ctx, 99, 224, 7, '#4d7a35');
  circle(ctx, 117, 224, 7, '#e2574c');
  // The stall cat sits only in the original.
  if (variant === 0) {
    ellipse(ctx, 168, 234, 14, 8, '#3a3230');
    circle(ctx, 180, 226, 8, '#3a3230');
    poly(ctx, [[176, 219], [178, 212], [181, 219]], '#3a3230');
    poly(ctx, [[183, 219], [186, 212], [188, 219]], '#3a3230');
    ctx.strokeStyle = '#3a3230';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(156, 232);
    ctx.quadraticCurveTo(146, 228, 148, 218);
    ctx.stroke();
  }

  // Stall 2 (centre): the vendor and her pots.
  rect(ctx, 240, 240, 140, 10, '#5d3f22');
  for (let i = 0; i < 7; i++) {
    rect(ctx, 240 + i * 20, 196, 20, 44, i % 2 === 0 ? '#c08a2d' : '#f6ead2');
  }
  rect(ctx, 246, 240, 8, 110, '#7a4a2b');
  rect(ctx, 366, 240, 8, 110, '#7a4a2b');
  rect(ctx, 240, 240, 140, 12, '#8a6a44');
  // Vendor.
  circle(ctx, 310, 226, 14, '#f3c39a');
  poly(ctx, [[282, 252], [310, 196], [338, 252]], '#7a4a8a');
  ellipse(ctx, 310, 210, 16, 6, '#5d3a6e');
  rect(ctx, 306, 200, 8, 12, '#5d3a6e');
  circle(ctx, 304, 224, 2, '#2b2118');
  circle(ctx, 316, 224, 2, '#2b2118');
  ctx.strokeStyle = '#2b2118';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(310, 230, 4, 0.2, Math.PI - 0.2);
  ctx.stroke();
  // Pots on the counter.
  ellipse(ctx, 262, 236, 10, 7, '#b3402e');
  ellipse(ctx, 282, 236, 10, 7, '#1f6f6b');
  ellipse(ctx, 342, 236, 10, 7, '#c08a2d');
  ellipse(ctx, 360, 236, 10, 7, '#4d7a35');

  // Stall 3 (right): toys and balloons. The twin is one balloon short.
  rect(ctx, 420, 240, 140, 10, '#5d3f22');
  for (let i = 0; i < 7; i++) {
    rect(ctx, 420 + i * 20, 196, 20, 44, i % 2 === 0 ? '#2f6fb0' : '#f6ead2');
  }
  rect(ctx, 426, 240, 8, 110, '#7a4a2b');
  rect(ctx, 546, 240, 8, 110, '#7a4a2b');
  rect(ctx, 420, 240, 140, 12, '#8a6a44');
  // Pinwheels on the counter.
  for (const x of [448, 478, 508]) {
    ctx.strokeStyle = '#7a4a2b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 240);
    ctx.lineTo(x, 216);
    ctx.stroke();
    for (let k = 0; k < 4; k++) {
      ctx.fillStyle = ['#e2574c', '#ffd94d', '#4d9de0', '#4d7a35'][k];
      ctx.beginPath();
      ctx.moveTo(x, 212);
      ctx.lineTo(x + Math.cos(k * 1.5708) * 8, 212 + Math.sin(k * 1.5708) * 8);
      ctx.lineTo(x + Math.cos(k * 1.5708 + 0.8) * 8, 212 + Math.sin(k * 1.5708 + 0.8) * 8);
      ctx.closePath();
      ctx.fill();
    }
  }
  // Balloons above the stall.
  function balloon(x, y, color) {
    ctx.strokeStyle = 'rgba(246,234,210,0.8)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y + 16);
    ctx.quadraticCurveTo(x - 6, y + 34, x + 2, y + 48);
    ctx.stroke();
    ellipse(ctx, x, y, 12, 15, color);
    poly(ctx, [[x - 4, y + 14], [x + 4, y + 14], [x, y + 20]], color);
  }
  balloon(520, 148, '#e2574c');
  balloon(544, 158, '#ffd94d');
  if (variant === 0) balloon(498, 158, '#4d9de0');
  void rng;
}

const MARKET_DIFFS = [
  { id: 'moon', name: 'Moon phase', x: 90, y: 70, r: 28, hint: 'Full moon or crescent tonight?' },
  { id: 'lantern', name: 'Lantern colour', x: 300, y: 162, r: 26, hint: 'The middle paper lantern changed colour.' },
  { id: 'kite', name: 'Kite', x: 480, y: 96, r: 28, hint: 'Something flies in the night sky.' },
  { id: 'balloon', name: 'Blue balloon', x: 498, y: 158, r: 24, hint: 'Count the balloons above the toy stall.' },
  { id: 'awning', name: 'Awning stripes', x: 130, y: 218, r: 28, hint: 'The left stall’s awning stripes are a different colour.' },
  { id: 'star', name: 'Bright star', x: 380, y: 58, r: 24, hint: 'One bright star shines — or is it gone?' },
  { id: 'cat', name: 'Stall cat', x: 168, y: 230, r: 24, hint: 'A cat keeps watch on the fruit stall.' },
];

// ---------------------------------------------------------------------------
// The four scenes, in play order. Later scenes get less time.
// ---------------------------------------------------------------------------
export const SCENES = [
  { id: 'harbor', name: 'Harbor Dawn', subtitle: 'The fishing boats are leaving with the tide.', timeLimit: 180, draw: drawHarbor, differences: HARBOR_DIFFS },
  { id: 'garden', name: 'Enchanted Garden', subtitle: 'The fountain is singing and the bees are out.', timeLimit: 150, draw: drawGarden, differences: GARDEN_DIFFS },
  { id: 'library', name: 'The Old Library', subtitle: 'Dust, leather and one very sleepy cat.', timeLimit: 120, draw: drawLibrary, differences: LIBRARY_DIFFS },
  { id: 'market', name: 'Night Market', subtitle: 'Lanterns up, stalls open, moon watching.', timeLimit: 120, draw: drawMarket, differences: MARKET_DIFFS },
];

export function paintScene(ctx, scene, variant) {
  ctx.clearRect(0, 0, PANEL_W, PANEL_H);
  scene.draw(ctx, variant);
}
