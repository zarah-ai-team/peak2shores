/**
 * Wire real photographs into the site by dropping files into `public/images/`.
 *
 *   npm run images
 *
 * Any file whose basename matches a slot key in `src/lib/media.ts` — e.g.
 * `public/images/home-hero.jpg` for the `home-hero` slot — is written into
 * `src/lib/media.generated.ts`, which `getMedia()` merges over the registry.
 * No hand-editing, no imports to update.
 *
 * The script also rewrites `PHOTOGRAPHY-BRIEF.md`: the full shot list with the
 * art direction for every slot, and which ones are still outstanding. Hand that
 * file to the photographer.
 *
 * Runs automatically before `npm run build` and `npm run dev`.
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = join(root, 'public', 'images');
const registryPath = join(root, 'src', 'lib', 'media.ts');
const generatedPath = join(root, 'src', 'lib', 'media.generated.ts');
const briefPath = join(root, 'PHOTOGRAPHY-BRIEF.md');

const SUPPORTED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif']);

/**
 * Read the slot keys, labels and briefs straight out of the registry.
 *
 * Brace-matched rather than regex-scraped, so entries written on one line and
 * entries spread over several are both picked up — a shot list that silently
 * drops frames is worse than no shot list.
 */
function readRegistry() {
  const source = readFileSync(registryPath, 'utf8');
  const start = source.indexOf('export const media = {');
  const end = source.indexOf('} as const satisfies');
  if (start < 0 || end < 0) {
    throw new Error('Could not locate the media registry in src/lib/media.ts');
  }

  const body = source.slice(source.indexOf('{', start) + 1, end);
  const slots = [];

  // Each match is a `key: {`. After reading its object we push lastIndex past
  // the closing brace, so nested keys are never mistaken for slots.
  const entry = /(?:'([^']+)'|([A-Za-z][\w-]*))\s*:\s*\{/g;

  let m;
  while ((m = entry.exec(body))) {
    const key = m[1] ?? m[2];
    // Walk to the matching close brace, ignoring braces inside strings.
    let depth = 0;
    let j = entry.lastIndex - 1;
    let quote = null;
    for (; j < body.length; j++) {
      const ch = body[j];
      if (quote) {
        if (ch === '\\') j++;
        else if (ch === quote) quote = null;
        continue;
      }
      // A line comment inside the registry must not put the scanner into
      // string mode on a stray apostrophe.
      if (ch === '/' && body[j + 1] === '/') {
        const eol = body.indexOf('\n', j);
        j = eol < 0 ? body.length : eol;
        continue;
      }
      if (ch === "'" || ch === '"' || ch === '`') quote = ch;
      else if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) break;
      }
    }

    const fields = body.slice(entry.lastIndex, j);
    const read = (name) => {
      // `name: '…'` or `name: "…"` — Prettier picks whichever quote needs no
      // escaping — allowing a line break after the colon.
      const r = new RegExp(String.raw`\b${name}:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")`);
      const hit = r.exec(fields);
      if (!hit) return null;
      return hit[1] !== undefined ? hit[1].replace(/\\'/g, "'") : hit[2].replace(/\\"/g, '"');
    };

    slots.push({
      key,
      label: read('label') ?? key,
      brief: read('brief') ?? '',
      tone: read('tone') ?? '',
      declaredSrc: read('src'),
    });

    entry.lastIndex = j + 1;
  }

  return slots;
}

function readDroppedFiles() {
  if (!existsSync(imagesDir)) {
    mkdirSync(imagesDir, { recursive: true });
    return new Map();
  }
  const found = new Map();
  for (const file of readdirSync(imagesDir)) {
    const ext = extname(file).toLowerCase();
    if (!SUPPORTED.has(ext)) continue;
    found.set(basename(file, ext), `/images/${file}`);
  }
  return found;
}

const slots = readRegistry();

// Belt and braces: an independent count of top-level keys. If the scanner ever
// loses its place, this fails loudly rather than shipping a short shot list.
{
  const src = readFileSync(registryPath, 'utf8');
  const region = src.slice(
    src.indexOf('export const media = {'),
    src.indexOf('} as const satisfies'),
  );
  const expected = (region.match(/^ {2}(?:'[^']+'|[A-Za-z][\w-]*)\s*:\s*\{/gm) ?? []).length;
  if (expected !== slots.length) {
    throw new Error(
      `[images] registry scan found ${slots.length} slots but ${expected} keys exist`,
    );
  }
}

/** Write only when the content changes, so `predev` does not churn mtimes. */
function writeIfChanged(path, content) {
  if (existsSync(path) && readFileSync(path, 'utf8') === content) return;
  writeFileSync(path, content, 'utf8');
}
const dropped = readDroppedFiles();

const matched = slots.filter((s) => dropped.has(s.key));
const unmatchedFiles = [...dropped.keys()].filter((k) => !slots.some((s) => s.key === k));
const outstanding = slots.filter((s) => !dropped.has(s.key) && !s.declaredSrc);

/* -- src/lib/media.generated.ts ------------------------------------------ */

// Quote a key only when it is not a plain identifier, so the generated file is
// already in the shape Prettier puts it in.
const keyFor = (key) => (/^[A-Za-z_$][\w$]*$/.test(key) ? key : `'${key}'`);
const entries = matched
  .map((s) => `  ${keyFor(s.key)}: { src: '${dropped.get(s.key)}' },`)
  .join('\n');

const generated = `// GENERATED by scripts/sync-images.mjs — do not edit by hand.
// Drop photographs into public/images/ named after a slot key, then run
// \`npm run images\`. getMedia() merges these over the registry in media.ts.

export const discovered: Record<string, { src: string }> = ${entries ? `{\n${entries}\n}` : '{}'};
`;

writeIfChanged(generatedPath, generated);

/* -- PHOTOGRAPHY-BRIEF.md ------------------------------------------------ */

// Provenance of whatever is in the slot today, so the shot list can say what
// is licensed stock (a stand-in), what is a brand asset (final) and what is
// still empty. Written by scripts/source-photography.mjs and fetch-stock.mjs.
const creditsPath = join(imagesDir, 'credits.json');
const credits = existsSync(creditsPath) ? JSON.parse(readFileSync(creditsPath, 'utf8')) : {};

/** How a slot is filled today. */
function provenance(s) {
  if (s.declaredSrc && !dropped.has(s.key)) return { kind: 'brand', text: '✅ brand asset (final)' };
  if (!dropped.has(s.key)) return { kind: 'empty', text: '— outstanding' };
  const c = credits[s.key];
  if (!c) return { kind: 'supplied', text: '✅ supplied' };
  const source = c.source ?? 'wikimedia';
  const name = { unsplash: 'Unsplash', pexels: 'Pexels', wikimedia: 'Commons' }[source] ?? source;
  return { kind: 'stock', text: `stock · ${name} · ${c.licence}` };
}

/**
 * Frames to commission first: every hero and featured frame, and anything that
 * stands in for Peaks2Shores' own people and hosts. Stock can carry the rest
 * until a second shoot.
 */
const COMMISSION_FIRST = new Set([
  'home-hero',
  'home-hero-2',
  'home-hero-3',
  'am-hero',
  'jl-1',
  'jl-2',
  'jl-3',
  'jl-4',
  'jl-5',
  'feat-1',
  'feat-2',
  'feat-3',
  'pillar-1',
  'pillar-3',
  'ex-2',
  'd7',
  'g3',
  'hotel-1',
  'hotel-2',
  'hotel-3',
  'am-h1',
  'am-h2',
]);

const row = (s) => `| \`${s.key}\` | ${s.label} | ${s.brief} | ${provenance(s).text} |`;

const byKind = (kind) => slots.filter((s) => provenance(s).kind === kind);
const stockSlots = byKind('stock');
const brandSlots = byKind('brand');
const commissionFirst = slots.filter((s) => COMMISSION_FIRST.has(s.key));

const brief = `# Peaks2Shores — photography shot list

_Generated by \`npm run images\` from \`src/lib/media.ts\`. Do not edit by hand._

**${matched.length + slots.filter((s) => s.declaredSrc).length} of ${slots.length}** frames
have a photograph. **${outstanding.length}** are outstanding.

## How to supply a photograph

Name the file after the slot key and drop it into \`public/images/\`:

\`\`\`
public/images/home-hero.jpg
public/images/pillar-1.jpg
\`\`\`

Then run \`npm run images\`. Nothing else needs editing. \`.jpg\`, \`.png\`,
\`.webp\` and \`.avif\` are all accepted; Next.js re-encodes and resizes at build.

**Sizing.** Full-bleed heroes (\`home-hero\`, \`am-hero\`) want at least 2400px on
the long edge. Half-width and column frames are fine at 1600px. Everything is
cropped with \`object-fit: cover\`, so keep the subject away from the edges.

## What is in the slots today

- **${brandSlots.length} brand asset${brandSlots.length === 1 ? '' : 's'}, final:** ${
  brandSlots.map((s) => `\`${s.key}\``).join(', ') || 'none'
}. Never substitute these.
- **${stockSlots.length} licensed stock stand-ins**, chosen against the brief below
  for destination, light and calm. Provenance and licences are in
  \`public/images/credits.json\`, \`public/images/CREDITS.md\` and on \`/credits\`.
  They are good enough to launch on, but they are not ours: anyone can use them.
- **${outstanding.length} empty.**

## Commission first

Stock can carry the day-by-day frames. These ${commissionFirst.length} cannot, because they carry the
brand or stand in for our own hosts, guests and partner properties. Book them
first:

${commissionFirst.map((s) => `- \`${s.key}\` — ${s.label}: ${s.brief}`).join('\n')}

Hotel slots currently show generic regional properties; replace them only with
photography of a partner hotel that we are licensed to use.

## The shot list

| Slot | Frame | Art direction | Status |
| --- | --- | --- | --- |
${slots.map(row).join('\n')}
`;

writeIfChanged(briefPath, brief);

/* -- Report -------------------------------------------------------------- */

const supplied = matched.length + slots.filter((s) => s.declaredSrc).length;
console.log(`[images] ${supplied}/${slots.length} frames have a photograph.`);
if (matched.length) {
  console.log(`[images] wired: ${matched.map((s) => s.key).join(', ')}`);
}
if (unmatchedFiles.length) {
  console.warn(
    `[images] in public/images/ but not a slot key (ignored): ${unmatchedFiles.join(', ')}`,
  );
  console.warn('[images] check the spelling against PHOTOGRAPHY-BRIEF.md.');
}
if (outstanding.length) {
  console.log(`[images] ${outstanding.length} still outstanding — see PHOTOGRAPHY-BRIEF.md.`);
}
