import { preload } from 'react-dom';

/*
 * The fonts a journey page's opening words are set in, preloaded on the
 * journey pages only (page-speed pass of 27 Nov 2026). The root layout no
 * longer preloads its fonts, which helps the pages whose largest paint is a
 * photograph (home, Journeys); a journey page's largest paint is its opening
 * words, which wait for these. They are the layout's own files (next/font,
 * the Latin subset): Instrument Sans roman, Newsreader roman and Newsreader
 * italic (the emphasized words of the title). A second next/font call here
 * would not do: next/font names a preloaded font's files apart (".p"), so the
 * page would fetch each font twice.
 *
 * The names are the files' content hashes, as the build writes them to
 * /_next/static/media. Should the fonts ever change (a new version from
 * Google Fonts), the names change with them: these preloads then go unused,
 * nothing breaks, and the names here need updating from the built CSS.
 */
const FONTS = [
  '/_next/static/media/42c0d1ff9eba2829-s.woff2', // Instrument Sans, roman
  '/_next/static/media/84adbee2f2a7cb50-s.woff2', // Newsreader, roman
  '/_next/static/media/8edf6d3506a17285-s.woff2', // Newsreader, italic
];

export function preloadJourneyFonts() {
  for (const href of FONTS) preload(href, { as: 'font', type: 'font/woff2', crossOrigin: '' });
}
