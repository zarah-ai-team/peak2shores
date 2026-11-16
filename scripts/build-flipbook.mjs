/**
 * Build a static site that is only the Journey Book (the page-turning
 * coming-soon page in public/journey-book), served at the domain root.
 *
 *   npm run build:flipbook     →  ./out
 *
 * For the period before the full site launches. The book is one self-contained
 * page, so this only copies it: the page itself with its base address moved
 * from /journey-book/ to /, its photographs, and the site icon. /journey-book/
 * keeps working and forwards to the root, so links already shared still land.
 *
 * The host should serve index.html for unknown addresses (a catch-all), so
 * every old link to the previous site arrives at the book rather than an error.
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

mkdirSync(join(out, 'journey-book'));
writeFileSync(
  join(out, 'journey-book', 'index.html'),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>The Journey Book · Peaks2Shores</title>` +
    `<link rel="canonical" href="${SITE}"><meta http-equiv="refresh" content="0; url=/"></head>` +
    `<body><p><a href="/">The Journey Book</a></p></body></html>\n`,
);

writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n`);

console.log('Journey Book site ready in ./out');
