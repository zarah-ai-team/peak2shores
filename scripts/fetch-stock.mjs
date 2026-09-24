/**
 * Fill the photography slots with freely-licensed images from Wikimedia
 * Commons, as comps.
 *
 *   node scripts/fetch-stock.mjs            # only slots that are still empty
 *   node scripts/fetch-stock.mjs --force    # re-fetch everything
 *   node scripts/fetch-stock.mjs a b c      # re-fetch just these slots
 *
 * THESE ARE PLACEHOLDERS WITH BETTER PIXELS, NOT ART DIRECTION.
 *
 * Nothing here was shot for this brand. Every file's source, author and licence
 * is recorded in `public/images/CREDITS.md`. Two things to settle before launch:
 *
 *   1. Licences. CC BY and CC BY-SA require visible attribution; CC BY-SA also
 *      carries share-alike terms. Public-domain and CC0 files carry neither.
 *   2. People. Copyright is not a model release. Queries below deliberately
 *      avoid portraits, but check anything with a face before it goes live.
 *
 * Commons is a documentary archive, not a stock library, so selection is picky:
 * it searches the curated "Quality images" pool first, rejects paintings, maps,
 * archival prints and near-monochrome files, and refuses to use one photograph
 * for two slots. Replace all of it with commissioned work and this is dead code.
 */

import {
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
  statSync,
} from 'node:fs';
import { join, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = join(root, 'public', 'images');
const creditsPath = join(imagesDir, 'CREDITS.md');
/** Provenance accumulates here, so a partial run never loses earlier credits. */
const manifestPath = join(imagesDir, 'credits.json');

const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'Peaks2Shores-site-build/1.0 (placeholder comp sourcing; hello@peaks2shores.com)';

/** Comps do not need to be masters. Cap the long edge and re-encode. */
const MAX_WIDTH = 2400;
const JPEG_QUALITY = 82;
/** Commons gives up thumbnailing very large originals; skip them at selection. */
const MAX_SOURCE_BYTES = 25 * 1024 * 1024;
/** Below this mean saturation an image reads as black and white. */
const MIN_SATURATION = 14;

/**
 * Slot → search terms, best first.
 *
 * Queries lean towards places and things rather than people: Commons has
 * excellent landscape coverage and almost no usable candid portraiture, and a
 * face on a commercial page needs a release we do not have.
 */
const QUERIES = {
  'home-hero': ['Amalfi Coast sea', 'Positano coast', 'Amalfi Coast'],
  'home-hero-2': ['Alps lake mountains', 'Swiss mountain lake', 'Alps landscape lake'],
  'home-hero-3': ['sea horizon evening', 'Mediterranean sea sunset', 'ocean evening light'],
  'pillar-1': ['Positano stairs alley', 'Amalfi Coast village alley', 'Italian village staircase'],
  'pillar-2': ['terrace table sea', 'restaurant terrace sea view', 'pergola terrace Italy'],
  'pillar-3': ['market stall fruit Italy', 'lemons market Italy', 'vegetable market Europe'],
  'pillar-4': ['outdoor swimming pool mountains', 'hotel outdoor pool', 'swimming pool sea view'],
  'feat-1': ['Positano beach boats', 'Positano', 'Amalfi Coast'],
  'feat-2': ['Lake Lucerne', 'Vierwaldstattersee', 'Lucerne lake mountains'],
  'feat-3': ['Serra de Tramuntana olive', 'Mallorca olive terrace', 'Serra de Tramuntana'],
  'tr-1': ['Matterhorn', 'Bernese Alps peaks', 'Swiss mountain peaks'],
  'tr-2': ['Oeschinensee lake water', 'Blausee lake', 'alpine lake water mountains'],
  'tr-3': ['Mediterranean coast Italy', 'Liguria coast', 'Ligurian sea coast'],
  'tr-4': ['Miami Beach', 'Miami skyline', 'South Beach Miami'],
  'ex-1': ['vineyard rows Tuscany', 'vineyard landscape Italy', 'wine tasting table'],
  'ex-2': ['pottery workshop', 'ceramics workshop', 'artisan pottery'],
  'ex-3': ['cloister Italy', 'Italian village alley', 'medieval village street Italy'],
  'ex-4': ['mountain hiking path Alps', 'Alps trail', 'sailing boat sea'],
  'ex-5': ['hotel room interior', 'bedroom balcony sea', 'hotel suite interior'],
  'hotel-1': ['Amalfi Coast hotel terrace', 'Positano hotel', 'Amalfi Coast village'],
  'hotel-2': ['Lucerne quay buildings', 'Lucerne waterfront', 'Lucerne city lake'],
  'hotel-3': ['Mallorca finca', 'Mallorca stone house', 'Mallorca courtyard'],
  'jl-1': ['Amalfi town', 'Atrani', 'Amalfi Coast Ravello'],
  'jl-2': ['Engadin valley', 'Sils lake Engadin', 'Silvaplana lake'],
  'jl-3': ['Valldemossa Mallorca', 'Deia Mallorca', 'Mallorca village Tramuntana'],
  'jl-4': ['vineyard Western Cape mountains', 'Cape vineyard landscape', 'vineyard rows mountains'],
  'jl-5': ['Villa del Balbianello', 'Bellagio Como shore', 'Lake Como town shore'],
  'am-hero': ['Amalfi Coast cliffs sea', 'Furore coast', 'Praiano Amalfi Coast'],
  'am-why': ['lemon tree fruit', 'citrus terraces Italy', 'lemon grove trees'],
  'am-map': ['Sorrento peninsula coast', 'Gulf of Naples coast', 'Amalfi Coast aerial'],
  'am-h1': ['Positano hotel terrace', 'Positano houses', 'Positano'],
  'am-h2': [
    'Chiostro del Paradiso Amalfi',
    'cloister columns garden Italy',
    'convent cloister Campania',
  ],
  d1: ['Amalfi Coast dusk', 'Positano evening', 'Amalfi Coast sunset'],
  d2: ['Positano', 'Amalfi Coast village houses', 'Atrani village'],
  d3: ['gozzo boat Italy', 'small boat clear water Italy', 'rowing boat turquoise sea'],
  d4: ['Villa Cimbrone Ravello', 'Villa Rufolo garden Ravello', 'Ravello terrace sea'],
  d5: ['Positano beach', 'Amalfi Coast beach sunbeds', 'Marina Grande Positano'],
  d6: ['Faraglioni Capri', 'Capri island sea', 'Capri coast'],
  d7: ['fresh pasta dough rolling', 'homemade pasta board', 'mozzarella di bufala campana'],
  d8: ['Amalfi Coast footpath', 'coastal path Italy sea', 'Path of the Gods Amalfi'],
  d9: ['Sorrento coast morning', 'Amalfi Coast morning light', 'Gulf of Naples morning'],
  g1: ['Amalfi Coast evening sea', 'Amalfi Coast from sea', 'Conca dei Marini'],
  g2: ['lemons Amalfi', 'lemon fruit', 'citrus lemons'],
  g3: ['restaurant terrace Italy', 'trattoria table', 'Italian dinner table'],
  g4: ['cloister arches', 'romanesque cloister', 'arcade columns Italy'],
  g5: ['terrace chairs sea Italy', 'pergola terrace sea', 'balcony chairs Mediterranean'],
  /* The Swiss Lakes, day by day */
  'sl-1': ['Lucerne lake steamer', 'Lucerne Chapel Bridge lake', 'Lucerne lakefront'],
  'sl-2': ['paddle steamer Lake Lucerne', 'Vierwaldstättersee Dampfschiff', 'Lake Lucerne boat'],
  'sl-3': ['Pilatus railway', 'Pilatus summit clouds', 'Pilatus mountain Lucerne'],
  'sl-4': ['Landwasser Viaduct', 'Albula railway viaduct', 'Rhaetian Railway Albula'],
  'sl-5': ['Lake Sils', 'Silsersee', 'Lej da Segl'],
  'sl-6': ['Guarda Engadin village', 'Engadin sgraffito house', 'Zuoz village'],
  'sl-7': ['rowing boat alpine lake', 'Lake Silvaplana boat', 'wooden boat mountain lake'],
  'sl-8': ['Zürich lake morning', 'Zürichsee', 'Zurich lake shore'],
  /* Mallorca, day by day */
  'ma-1': ['Serra de Tramuntana road', 'Tramuntana mountains Mallorca', 'Mallorca mountains olive'],
  'ma-2': ['Deià Mallorca', 'Deia village Mallorca', 'Valldemossa'],
  'ma-3': ['Cala Mallorca turquoise', 'Sa Calobra', 'Mallorca cove sea'],
  'ma-4': ['old olive tree Mallorca', 'olive trees Mallorca', 'olive grove Mediterranean'],
  'ma-5': ['Sóller train', 'Ferrocarril de Sóller', 'Soller orange trees'],
  'ma-6': ['Mallorca finca pool', 'finca Mallorca', 'Mallorca stone house garden'],
  'ma-7': ['Palma cathedral morning', 'Palma de Mallorca old town', 'Palma Mallorca'],
  /* The Cape, day by day */
  'cp-1': ['Table Mountain Cape Town', 'Table Mountain sunset', 'Cape Town Table Mountain'],
  'cp-2': ['Cape Town from Table Mountain', 'Lion’s Head Cape Town', 'Cape Town aerial'],
  'cp-3': ['Cape Dutch farmhouse vineyard', 'Franschhoek vineyard', 'Stellenbosch wine farm'],
  'cp-4': ['vineyard rows Stellenbosch', 'Franschhoek vines mountains', 'Western Cape vineyard'],
  'cp-5': ['long table outdoor dinner', 'dinner table garden evening', 'outdoor dining table dusk'],
  'cp-6': ['Franschhoek sunset', 'Stellenbosch sunset mountains', 'winelands sunset'],
  'cp-7': ['Chapman’s Peak Drive', 'Chapmans Peak', 'Hout Bay coast road'],
  'cp-8': ['Cape Point cliffs', 'Boulders Beach penguins', 'Cape of Good Hope'],
  'cp-9': ['Noordhoek beach', 'Kommetjie beach', 'Cape Town Atlantic beach'],
  'cp-10': ['beach bonfire evening', 'campfire beach sunset', 'fire on beach'],
  'cp-11': ['Cape Town harbour', 'Cape Town waterfront morning', 'V&A Waterfront'],
  /* Como & the Engadin, day by day */
  'ce-1': ['Villa Carlotta garden lake', 'Lake Como villa garden', 'Villa Melzi Como'],
  'ce-2': ['Lake Como boat', 'Lago di Como barca', 'Lake Como from the water'],
  'ce-3': ['Bellagio Lake Como', 'Bellagio point', 'Villa Serbelloni Bellagio'],
  'ce-4': ['Lake Como jetty', 'Lake Como pier', 'Varenna Lake Como'],
  'ce-5': ['Bernina railway Brusio', 'Brusio spiral viaduct', 'Bernina Express'],
  'ce-6': ['St. Moritz lake', 'St. Moritz', 'Lej da San Murezzan'],
  'ce-7': ['Val Roseg autumn', 'larch autumn Engadin', 'Roseg valley'],
  'ce-8': ['Lej da Staz', 'Engadin lake dawn', 'Silvaplana lake morning'],
  'ce-9': ['Soglio', 'Soglio Bregaglia', 'Val Bregaglia village'],
  'ce-10': ['Rhaetian Railway train mountains', 'Swiss train mountains', 'Albula train autumn'],
  'jn-1': ['Engadin autumn larch', 'larch forest autumn', 'Engadin autumn'],
  'jn-2': ['Amalfi Coast beach', 'Mediterranean beach Italy', 'Amalfi shore'],
  'jn-3': [
    'antipasto plate restaurant',
    'Italian restaurant table food',
    'wine glasses dinner table',
  ],
  'jn-4': ['hotel lounge interior', 'library reading room', 'hotel lobby interior'],
};

/** Titles that are almost never the photograph a travel page wants. */
const TITLE_REJECT =
  /(painting|paint\b|drawing|engraving|etching|lithograph|photochrom|postcard|woodcut|watercolou?r|sketch|illustration|map|plan of|diagram|chart|coat of arms|logo|stamp|banknote|poster|advertisement|manuscript|document|catalogue|card\b|portrait of|statue of|bust of|1[0-8]\d\d|19[0-5]\d|360|equirectangular|spherical|panorama|stitch)/i;

/**
 * Licences we will take. Anything else is skipped rather than guessed at —
 * a wrong licence is worse than an empty frame.
 */
const ALLOWED = [
  /^cc0/i,
  /^public domain/i,
  /^pd/i,
  /^cc[ -]by[ -]sa[ -]?[0-9.]*$/i,
  /^cc[ -]by[ -]?[0-9.]*$/i,
];

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = new Set(args.filter((a) => !a.startsWith('--')));

function licenceOk(short) {
  return short ? ALLOWED.some((r) => r.test(short.trim())) : false;
}

function stripHtml(s) {
  return String(s ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', origin: '*', ...params })}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
    signal: AbortSignal.timeout(45_000),
  });
  if (!res.ok) throw new Error(`Commons ${res.status}`);
  return res.json();
}

/** Candidate photographs for one search, best first, already filtered. */
async function candidates(search) {
  let data;
  try {
    data = await api({
      action: 'query',
      generator: 'search',
      gsrsearch: `${search} filetype:bitmap`,
      gsrnamespace: '6',
      gsrlimit: '30',
      prop: 'imageinfo',
      iiprop: 'url|size|extmetadata',
      iiurlwidth: String(MAX_WIDTH),
    });
  } catch {
    return [];
  }

  const pages = Object.values(data?.query?.pages ?? {});
  // The search generator returns pages unordered; restore relevance order.
  pages.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  const out = [];
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info?.thumburl) continue;

    const meta = info.extmetadata ?? {};
    const licence = stripHtml(meta.LicenseShortName?.value);
    if (!licenceOk(licence)) continue;

    const { width, height, size } = info;
    if (!width || !height || width < 1400) continue;
    if (height > width) continue; // every frame on the site is landscape
    if (size && size > MAX_SOURCE_BYTES) continue;

    const haystack = `${page.title} ${stripHtml(meta.ObjectName?.value)} ${stripHtml(
      meta.Categories?.value,
    )}`;
    if (TITLE_REJECT.test(haystack)) continue;

    out.push({
      title: page.title,
      pageUrl: info.descriptionurl,
      downloadUrl: info.thumburl,
      author: stripHtml(meta.Artist?.value) || 'Unknown',
      licence,
      width,
      height,
    });
  }
  return out;
}

async function fetchBuffer(url, attempt = 1) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) throw new Error(`download ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } catch (error) {
    if (attempt < 2) return fetchBuffer(url, attempt + 1);
    throw error;
  }
}

/**
 * Reject anything that reads as black and white. Archival monochrome is the
 * single most common way an otherwise on-subject Commons result is wrong for
 * this brand.
 */
async function isColour(buffer) {
  try {
    const { channels } = await sharp(buffer).stats();
    if (channels.length < 3) return false;
    const [r, g, b] = channels.map((c) => c.mean);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    // Cheap proxy for saturation: the spread between channel means.
    const spread = max - min;
    const perPixel = await sharp(buffer).resize(64, 64, { fit: 'cover' }).raw().toBuffer();
    let sat = 0;
    for (let i = 0; i < perPixel.length; i += 3) {
      const hi = Math.max(perPixel[i], perPixel[i + 1], perPixel[i + 2]);
      const lo = Math.min(perPixel[i], perPixel[i + 1], perPixel[i + 2]);
      sat += hi - lo;
    }
    sat /= perPixel.length / 3;
    return sat >= MIN_SATURATION || spread >= MIN_SATURATION;
  } catch {
    return true;
  }
}

function loadManifest() {
  if (!existsSync(manifestPath)) return {};
  try {
    return JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    return {};
  }
}

function existingFor(slot) {
  if (!existsSync(imagesDir)) return null;
  const hit = readdirSync(imagesDir).find(
    (f) => basename(f, extname(f)) === slot && !['.md', '.json'].includes(extname(f)),
  );
  return hit ? join(imagesDir, hit) : null;
}

/* -- Run ----------------------------------------------------------------- */

mkdirSync(imagesDir, { recursive: true });

const manifest = loadManifest();
const results = [];
const failures = [];

/** One photograph per slot — never the same file twice on one site. */
const used = new Set(
  Object.entries(manifest)
    .filter(([slot]) => !force && !only.has(slot))
    .map(([, entry]) => entry.title),
);

// Naming a slot explicitly means "give me a different one", so its current
// photograph joins the used set rather than being picked again.
for (const slot of only) {
  if (manifest[slot]?.title) used.add(manifest[slot].title);
}

for (const [slot, searches] of Object.entries(QUERIES)) {
  const already = existingFor(slot);
  const wanted = only.size ? only.has(slot) : true;
  if (already && !force && !wanted) continue;
  if (already && !force && only.size === 0) {
    console.log(`[stock] ${slot} — already present, skipping`);
    continue;
  }
  if (!wanted) continue;

  // "Quality images" is Commons' own curated pool; try it before open search.
  const attempts = [...searches.map((s) => `${s} incategory:"Quality images"`), ...searches];

  let chosen = null;
  let usedQuery = searches[0];

  outer: for (const attempt of attempts) {
    const list = await candidates(attempt);
    for (const candidate of list) {
      if (used.has(candidate.title)) continue;
      try {
        const buffer = await fetchBuffer(candidate.downloadUrl);
        if (!(await isColour(buffer))) continue;

        const dest = join(imagesDir, `${slot}.jpg`);
        if (already && already !== dest) unlinkSync(already);
        await sharp(buffer)
          .rotate()
          .resize({ width: MAX_WIDTH, withoutEnlargement: true })
          .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
          .toFile(dest);

        chosen = { ...candidate, file: basename(dest), bytes: statSync(dest).size };
        usedQuery = attempt.replace(' incategory:"Quality images"', '');
        used.add(candidate.title);
        break outer;
      } catch {
        // Try the next candidate rather than losing the slot.
      }
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!chosen) {
    failures.push({ slot, query: searches[0], reason: 'no candidate passed the filters' });
    console.warn(`[stock] ${slot} — nothing usable`);
    continue;
  }

  manifest[slot] = { slot, query: usedQuery, ...chosen };
  results.push(manifest[slot]);
  console.log(
    `[stock] ${slot} — ${chosen.file} (${Math.round(chosen.bytes / 1024)}kB) · ${chosen.licence} · ${usedQuery}`,
  );
}

/* -- CREDITS.md ---------------------------------------------------------- */

writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

const credited = Object.values(manifest).sort((a, b) => a.slot.localeCompare(b.slot));
const needsAttribution = credited.filter((r) => /^cc[ -]by/i.test(r.licence));

const credits = `# Placeholder photography — sources and licences

**These are comps, not art direction.** Every file below was found by keyword on
Wikimedia Commons and downscaled for the web. None of it was shot for
Peaks2Shores. Replace it with commissioned photography before launch; see
\`PHOTOGRAPHY-BRIEF.md\` for what each frame actually calls for.

Regenerate with \`node scripts/fetch-stock.mjs --force\`, or re-roll individual
frames with \`node scripts/fetch-stock.mjs <slot> <slot>\`.

## Two things to settle before this goes live

1. **Attribution.** ${needsAttribution.length} of ${credited.length} files are
   CC BY or CC BY-SA and require visible credit; CC BY-SA also carries
   share-alike terms. Public-domain and CC0 files carry neither.
2. **People.** A copyright licence is not a model release. Selection avoids
   portraits deliberately, but check any frame with a recognisable face before
   it appears on a commercial site.

## Files

| Slot | File | Source | Author | Licence |
| --- | --- | --- | --- | --- |
${credited
  .map(
    (r) => `| \`${r.slot}\` | ${r.file} | [Commons](${r.pageUrl}) | ${r.author} | ${r.licence} |`,
  )
  .join('\n')}
${
  failures.length
    ? `\n## Not filled\n\n${failures.map((f) => `- \`${f.slot}\` — ${f.reason}`).join('\n')}\n`
    : ''
}`;

writeFileSync(creditsPath, credits, 'utf8');

console.log(`\n[stock] ${results.length} fetched, ${failures.length} unfilled.`);
console.log('[stock] now run: npm run images');
