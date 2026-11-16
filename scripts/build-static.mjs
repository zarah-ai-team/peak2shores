/**
 * Build the site as plain files for a static host (no server).
 *
 *   npm run build:full-static     →  ./out
 *
 * What a static host cannot do, and what this does instead:
 *
 * - The two form endpoints (src/app/api) cannot run. They are set aside for
 *   the build, and the forms offer a ready-written email (src/lib/forms.ts).
 * - Photographs cannot be resized on request. Every size next/image may ask
 *   for is written ahead of time to out/_img (src/lib/staticImageLoader.ts).
 * - Redirects from the old site's addresses cannot be sent as 301s. Each old
 *   address gets a small page that forwards to the new one.
 *
 * The server build (`npm run build`) is untouched by any of this.
 */
import { spawnSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { availableParallelism } from 'node:os';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { legacyRedirects, staticImageWidths } from '../next.config.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const outDir = join(root, 'out');
const apiDir = join(root, 'src', 'app', 'api');
const apiAside = join(root, 'src', 'app', '_api');
/* Kept outside `out` (which every build empties) so a second build only
   resizes photographs that are new or changed. */
const cacheDir = join(root, 'node_modules', '.cache', 'static-img');

const RASTER = /\.(jpe?g|png|webp|avif)$/i;
const WIDTHS = [...staticImageWidths.imageSizes, ...staticImageWidths.deviceSizes];
const SITE = 'https://peaks2shores.com';

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed`);
}

function walk(dir, found = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, found);
    else if (RASTER.test(entry.name)) found.push(path);
  }
  return found;
}

/** Every photograph in public/, at every width the static config can ask for. */
async function resizeImages() {
  const jobs = [];
  for (const file of walk(publicDir)) {
    const rel = relative(publicDir, file).split(sep).join('/');
    const modified = statSync(file).mtimeMs;
    for (const width of WIDTHS) {
      const target = join(cacheDir, `${rel}.${width}.webp`);
      if (existsSync(target) && statSync(target).mtimeMs >= modified) continue;
      jobs.push({ file, target, width });
    }
  }

  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const { file, target, width } = jobs[next++];
      mkdirSync(dirname(target), { recursive: true });
      await sharp(file)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(target);
    }
  };
  await Promise.all(Array.from({ length: availableParallelism() }, worker));
  console.log(`Photographs: ${jobs.length} sizes written, the rest reused.`);

  cpSync(cacheDir, join(outDir, '_img'), { recursive: true });
}

/** A page at each old address that sends the visitor, and search engines, on. */
function writeRedirectPages() {
  for (const { source, destination } of legacyRedirects) {
    const target = `${SITE}${destination === '/' ? '/' : `${destination}/`}`;
    const dir = join(outDir, source);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'index.html'),
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Peaks2Shores</title>` +
        `<link rel="canonical" href="${target}"><meta name="robots" content="noindex">` +
        `<meta http-equiv="refresh" content="0; url=${target}"></head>` +
        `<body><p><a href="${target}">This page has moved.</a></p></body></html>\n`,
    );
  }
  console.log(`Old addresses: ${legacyRedirects.length} forwarding pages written.`);
}

run('node', ['scripts/sync-images.mjs']);

const hadApi = existsSync(apiDir);
if (hadApi) renameSync(apiDir, apiAside);
try {
  run('npx', ['next', 'build'], { NEXT_PUBLIC_STATIC_EXPORT: '1' });
} finally {
  if (hadApi) renameSync(apiAside, apiDir);
}

await resizeImages();
writeRedirectPages();
console.log('Static site ready in ./out');
