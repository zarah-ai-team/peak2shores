/**
 * Build a static site that is only the Journey Book (the page-turning
 * coming-soon page in public/journey-book), served at the domain root.
 *
 *   npm run build:flipbook     →  ./out
 *
 * For the period before the full site launches. The book is one self-contained
 * page, so this only copies it: the page itself with its base address moved
 * from /journey-book/ to /, its photographs, and the site icon.
 *
 * /journey-book/ and the previous site's addresses each get a small page that
 * forwards to the root, so links already shared, and the ones search engines
 * hold, land on the book rather than an error.
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { legacyRedirects } from '../next.config.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const book = join(root, 'public', 'journey-book');
const out = join(root, 'out');
const SITE = 'https://peaks2shores.com/';

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const page = readFileSync(join(book, 'index.html'), 'utf8');
if (!page.includes('<base href="/journey-book/">')) {
  throw new Error(
    'public/journey-book/index.html no longer has the base address this script moves.',
  );
}
writeFileSync(
  join(out, 'index.html'),
  page.replace('<base href="/journey-book/">', '<base href="/">'),
);

cpSync(join(book, 'img'), join(out, 'img'), { recursive: true });
cpSync(join(root, 'src', 'app', 'favicon.ico'), join(out, 'favicon.ico'));

const forward = [
  '/journey-book',
  '/destinations',
  '/experiences',
  ...legacyRedirects.map((r) => r.source),
];
for (const path of forward) {
  mkdirSync(join(out, path), { recursive: true });
  writeFileSync(
    join(out, path, 'index.html'),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>The Journey Book · Peaks2Shores</title>` +
      `<link rel="canonical" href="${SITE}"><meta http-equiv="refresh" content="0; url=/"></head>` +
      `<body><p><a href="/">The Journey Book</a></p></body></html>\n`,
  );
}

writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n`);

console.log('Journey Book site ready in ./out');
