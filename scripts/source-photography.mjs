/**
 * Source the art-directed stock photography listed in
 * `scripts/photography-manifest.json` and record its provenance.
 *
 *   node scripts/source-photography.mjs            # fetch every slot in the manifest
 *   node scripts/source-photography.mjs a b c      # only these slots
 *   node scripts/source-photography.mjs --dry      # verify pages + licences, download nothing
 *   node scripts/source-photography.mjs --credits  # only regenerate CREDITS.md
 *
 * Every frame was chosen by eye from contact sheets, not by keyword. For each
 * entry the script reads the photo page's own structured data (photographer,
 * licence URL, location, caption) and refuses anything that is not under the
 * Unsplash License or is not free to use (Unsplash+). Nothing about a photo is
 * typed in by hand, so the credits can only say what the source page says.
 *
 * Files are written to `public/images/<slot>.jpg` (long edge ≤ 3840px, so
 * full-bleed frames stay sharp on 4K screens; JPEG q84, uncropped — every frame is laid out with object-fit: cover), and
 * `public/images/credits.json` is updated in place: replaced slots get the new
 * provenance, slots not in the manifest keep their existing entry.
 * `public/images/CREDITS.md` is regenerated from the result.
 */

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = join(root, 'public', 'images');
const manifestPath = join(root, 'scripts', 'photography-manifest.json');
const creditsJsonPath = join(imagesDir, 'credits.json');
const creditsMdPath = join(imagesDir, 'CREDITS.md');

const MAX_EDGE = 3840;
const JPEG_QUALITY = 84;
const UNSPLASH_LICENSE = 'https://unsplash.com/license';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const creditsOnly = args.includes('--credits');
const only = new Set(args.filter((a) => !a.startsWith('--')));

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const credits = JSON.parse(readFileSync(creditsJsonPath, 'utf8'));

async function get(url, as = 'text', attempt = 1) {
  try {
    // Unsplash answers 401 to an unfamiliar User-Agent; use the runtime default.
    const res = await fetch(url, {
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return as === 'text' ? await res.text() : Buffer.from(await res.arrayBuffer());
  } catch (error) {
    // Unsplash rate-limits bursts (429): back off hard rather than give up.
    const limited = String(error.message).startsWith('429');
    if (attempt < (limited ? 6 : 3)) {
      await new Promise((r) => setTimeout(r, (limited ? 20_000 : 800) * attempt));
      return get(url, as, attempt + 1);
    }
    throw error;
  }
}

/** The ImageObject JSON-LD block Unsplash embeds on every photo page. */
function readImageObject(html) {
  const blocks = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g) ?? [];
  for (const block of blocks) {
    const json = block.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, '');
    try {
      const data = JSON.parse(json);
      const items = Array.isArray(data) ? data : [data, ...(data['@graph'] ?? [])];
      const hit = items.find((d) => d && d['@type'] === 'ImageObject' && d.contentUrl);
      if (hit) return hit;
    } catch {
      // Not the block we want.
    }
  }
  return null;
}

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

async function sourceUnsplash(entry) {
  const pageUrl = `https://unsplash.com/photos/${entry.photo}`;
  const html = await get(pageUrl);
  const obj = readImageObject(html);
  if (!obj) throw new Error('no ImageObject on page');
  if (obj.license !== UNSPLASH_LICENSE) throw new Error(`licence is ${obj.license}`);
  if (obj.isAccessibleForFree === false) throw new Error('not free (Unsplash+)');
  const author = obj.creator?.name ?? obj.author?.name;
  if (!author) throw new Error('no photographer on page');

  const base = String(obj.contentUrl).split('?')[0];
  if (!/^https:\/\/images\.unsplash\.com\/photo-/.test(base)) {
    throw new Error(`unexpected image host ${base}`);
  }
  const downloadUrl = `${base}?w=${MAX_EDGE}&q=85&fm=jpg`;
  const id = entry.photo.split('-').pop();
  return {
    slot: entry.slot,
    source: 'unsplash',
    // The description is Unsplash's plain alt description; the caption is free text
    // ("Summer 2020.") and only a fallback.
    title: cap(obj.description || obj.caption || obj.name || id),
    caption: obj.caption ?? null,
    description: obj.description ?? null,
    location: obj.contentLocation?.name ?? null,
    pageUrl,
    downloadUrl,
    author,
    licence: 'Unsplash License',
    licenceUrl: UNSPLASH_LICENSE,
    width: parseInt(obj.width, 10) || null,
    height: parseInt(obj.height, 10) || null,
  };
}

async function writeImage(record) {
  const buffer = await get(record.downloadUrl, 'buffer');
  const dest = join(imagesDir, `${record.slot}.jpg`);
  const info = await sharp(buffer)
    .rotate()
    .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toFile(dest);
  return { file: `${record.slot}.jpg`, bytes: statSync(dest).size, fileWidth: info.width, fileHeight: info.height };
}

function writeCreditsMd(all) {
  const rows = Object.values(all).sort((a, b) => a.slot.localeCompare(b.slot));
  const bySource = (s) => rows.filter((r) => (r.source ?? 'wikimedia') === s);
  const stock = bySource('unsplash');
  const commons = bySource('wikimedia');
  const needsAttribution = rows.filter((r) => /^cc[ -]by/i.test(r.licence));
  const link = (r) =>
    r.source === 'unsplash' ? `[Unsplash](${r.pageUrl})` : `[Commons](${r.pageUrl})`;
  const md = `# Photography — sources and licences

_Generated by \`node scripts/source-photography.mjs --credits\` from
\`public/images/credits.json\`. Do not edit by hand._

**This is licensed stock, art-directed — not commissioned work.** Every frame
was chosen by eye against the brief in \`src/lib/media.ts\` (natural colour,
calm light, no crowds, the right destination) and its provenance read from the
source page itself. None of it was shot for Peaks2Shores; see
\`PHOTOGRAPHY-BRIEF.md\` for what a commissioned shoot should replace first.

- **${stock.length}** frames from Unsplash under the
  [Unsplash License](https://unsplash.com/license): free for commercial use, no
  attribution required (credited here and on \`/credits\` anyway). The licence
  does not allow selling the photos unaltered or compiling them into a
  competing image service.
- **${commons.length}** frames remain from Wikimedia Commons.
  ${needsAttribution.length} of them are CC BY / CC BY-SA and **require visible
  attribution** while in use (the \`/credits\` page provides it).

## Before launch

1. **People.** A copyright licence is not a model release. Frames were chosen
   with people small, distant or from behind; re-check any face before a
   campaign use.
2. **Hotels.** Hotel slots show generic regional property and terrace views. No
   frame depicts, or implies a partnership with, a named hotel.
3. **Locations.** Unsplash location tags are photographer-supplied and
   occasionally wrong; the \`location\` field in \`credits.json\` is recorded as
   published, not as verified.

## Files

| Slot | File | Source | Photographer | Licence |
| --- | --- | --- | --- | --- |
${rows
  .map((r) => `| \`${r.slot}\` | ${r.file} | ${link(r)} | ${r.author} | ${r.licence} |`)
  .join('\n')}
`;
  writeFileSync(creditsMdPath, md, 'utf8');
}

/* -- Run ----------------------------------------------------------------- */

if (!creditsOnly) {
  const failures = [];
  const queue = manifest.filter((e) => !only.size || only.has(e.slot));
  const CONCURRENCY = 2;
  let cursor = 0;

  async function worker() {
    while (cursor < queue.length) {
      const entry = queue[cursor++];
      try {
        if (entry.source !== 'unsplash') throw new Error(`unsupported source ${entry.source}`);
        const record = await sourceUnsplash(entry);
        if (dry) {
          console.log(`[dry] ${entry.slot.padEnd(12)} ${record.author} · ${record.location ?? '—'} · ${record.title}`);
          continue;
        }
        const file = await writeImage(record);
        credits[entry.slot] = { ...record, ...file };
        console.log(
          `[photo] ${entry.slot.padEnd(12)} ${file.fileWidth}x${file.fileHeight} ${Math.round(file.bytes / 1024)}kB · ${record.author} · ${record.location ?? '—'}`,
        );
      } catch (error) {
        failures.push({ slot: entry.slot, reason: error.message });
        console.warn(`[photo] ${entry.slot} — FAILED: ${error.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  if (!dry) {
    // Mark the Commons entries that remain, so every row says where it came from.
    for (const entry of Object.values(credits)) entry.source ??= 'wikimedia';
    const ordered = Object.fromEntries(
      Object.entries(credits).sort(([a], [b]) => a.localeCompare(b)),
    );
    writeFileSync(creditsJsonPath, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8');
  }
  console.log(`\n[photo] ${queue.length - failures.length}/${queue.length} ok`);
  if (failures.length) {
    for (const f of failures) console.warn(`  ${f.slot}: ${f.reason}`);
    process.exitCode = 1;
  }
}

if (!dry) {
  writeCreditsMd(JSON.parse(readFileSync(creditsJsonPath, 'utf8')));
  console.log('[photo] CREDITS.md regenerated');
}
