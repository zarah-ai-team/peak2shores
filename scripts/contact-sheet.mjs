/**
 * Build labelled contact sheets of everything in `public/images/`.
 *
 *   node scripts/contact-sheet.mjs [outDir]
 *
 * Reviewing photography one file at a time is how mismatches survive. A sheet
 * puts every frame beside its slot key and its brief, so a wrong subject is
 * obvious at a glance.
 */

import { readdirSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = join(root, 'public', 'images');
const outDir = process.argv[2] ?? join(root, '.contact-sheets');

const COLS = 4;
const ROWS = 3;
const CELL_W = 420;
const CELL_H = 260;
const LABEL_H = 34;
const PAD = 8;

const manifest = existsSync(join(imagesDir, 'credits.json'))
  ? JSON.parse(readFileSync(join(imagesDir, 'credits.json'), 'utf8'))
  : {};

const files = readdirSync(imagesDir)
  .filter((f) => ['.jpg', '.jpeg', '.png', '.webp'].includes(extname(f).toLowerCase()))
  .sort();

function escapeXml(s) {
  return String(s).replace(
    /[<>&'"]/g,
    (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c],
  );
}

function label(slot, note) {
  const svg = `<svg width="${CELL_W}" height="${LABEL_H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${CELL_W}" height="${LABEL_H}" fill="#111"/>
    <text x="8" y="14" font-family="monospace" font-size="13" fill="#fff">${escapeXml(slot)}</text>
    <text x="8" y="28" font-family="monospace" font-size="10" fill="#9c9c9c">${escapeXml(
      note.slice(0, 62),
    )}</text>
  </svg>`;
  return Buffer.from(svg);
}

mkdirSync(outDir, { recursive: true });

const perSheet = COLS * ROWS;
const sheets = Math.ceil(files.length / perSheet);
const cellTotalH = CELL_H + LABEL_H;

for (let s = 0; s < sheets; s++) {
  const batch = files.slice(s * perSheet, (s + 1) * perSheet);
  const rows = Math.ceil(batch.length / COLS);

  const canvas = sharp({
    create: {
      width: COLS * (CELL_W + PAD) + PAD,
      height: rows * (cellTotalH + PAD) + PAD,
      channels: 3,
      background: '#2b2b2b',
    },
  });

  const composites = [];
  for (let i = 0; i < batch.length; i++) {
    const file = batch[i];
    const slot = basename(file, extname(file));
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const left = PAD + col * (CELL_W + PAD);
    const top = PAD + row * (cellTotalH + PAD);

    const thumb = await sharp(join(imagesDir, file))
      .resize(CELL_W, CELL_H, { fit: 'cover' })
      .toBuffer();

    composites.push({ input: thumb, left, top });
    composites.push({
      input: label(slot, manifest[slot]?.query ?? ''),
      left,
      top: top + CELL_H,
    });
  }

  const out = join(outDir, `sheet-${s + 1}.png`);
  await canvas.composite(composites).png().toFile(out);
  console.log(`[sheet] ${out} — ${batch.length} frames`);
}

console.log(`[sheet] ${files.length} frames across ${sheets} sheet(s)`);
