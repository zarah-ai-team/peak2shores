import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/* This folder is the project root. Pinned so a stray lockfile in a parent
   folder cannot make Next pick the wrong workspace root. */
const projectRoot = dirname(fileURLToPath(import.meta.url));

/*
 * Security headers appropriate to a static marketing site.
 *
 * No Content-Security-Policy with script restrictions: Next emits inline
 * hydration scripts, the layout has an inline boot script, and Motion writes
 * inline styles, so a strict policy would need per-request nonces (which force
 * every page dynamic) and `style-src 'unsafe-inline'` regardless. The site
 * renders no user-supplied content, so the CSP here does the one thing that
 * needs no exceptions: it forbids framing. HSTS is left to the TLS terminator.
 */
const securityHeaders = [
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
  },
];

/*
 * Every address on the old Squarespace site (from its sitemap, October 2026)
 * that has no page of the same name here. Permanent, so search rankings and
 * existing links carry over. /destinations and /experiences keep their names.
 * Point the three destinations at their own pages once those exist.
 */
export const legacyRedirects = [
  { source: '/home', destination: '/' },
  { source: '/why-us', destination: '/our-story' },
  { source: '/start-exploring', destination: '/plan' },
  { source: '/switzerland', destination: '/destinations' },
  { source: '/mexico', destination: '/destinations' },
  { source: '/miami', destination: '/destinations' },
];

/* Preview and staging copies (Vercel previews, Netlify deploy previews) —
   never indexed. Mirrors src/lib/env.ts. */
const isProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : !process.env.CONTEXT || process.env.CONTEXT === 'production';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  outputFileTracingRoot: projectRoot,
  turbopack: { root: projectRoot },
  images: {
    // WebP only. AVIF is smaller but several times slower to encode, and on a
    // small instance with a cold cache that encode is what keeps a page of
    // photographs blank.
    formats: ['image/webp'],
    // Full-bleed photographs on retina and 4K screens need 2560 and 3840
    // variants; Marc's photographs are exported at up to 3840px for them.
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920, 2560, 3840],
    // One quality step, high enough that skies and water show no banding.
    qualities: [85],
    // Next's default is 60 seconds, so browsers and the CDN come back for every
    // photograph almost immediately. Files in public/images are replaced by
    // name rarely enough that a month is safe.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  async headers() {
    const headers = isProduction
      ? securityHeaders
      : [...securityHeaders, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [
      { source: '/(.*)', headers },
      // The *.vercel.app address (peak2shores-theta.vercel.app) is the preview
      // the client reviews before launch. Vercel counts it as production, so
      // it is kept out of search by host instead.
      {
        source: '/(.*)',
        has: [{ type: 'host', value: '(?<host>.*)\\.vercel\\.app' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
  async redirects() {
    return [
      // One address for the site: www answers, then sends people to the bare
      // domain that every canonical URL uses.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.peaks2shores.com' }],
        destination: 'https://peaks2shores.com/:path*',
        statusCode: 301,
      },
      ...legacyRedirects.map((r) => ({ ...r, statusCode: 301 })),
    ];
  },
  /* The Journey Book: the stand-alone, page-turning coming-soon page kept in
     public/journey-book, outside the site's header and footer. */
  async rewrites() {
    return [{ source: '/journey-book', destination: '/journey-book/index.html' }];
  },
};

/*
 * The static build (`npm run build:full-static`, scripts/build-static.mjs) for a
 * host with no server, such as a DigitalOcean static site. Plain files only:
 * photographs are resized ahead of time (src/lib/staticImageLoader.ts), each
 * page is a folder with an index.html, and the headers, redirects and rewrites
 * above, which need a server, are left out. The script writes the old-site
 * redirects as small pages instead.
 */
export const staticImageWidths = {
  deviceSizes: [640, 1080, 1600, 2560],
  imageSizes: [128, 256, 420],
};
const isStatic = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1';
const staticConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'export',
  trailingSlash: true,
  outputFileTracingRoot: projectRoot,
  turbopack: { root: projectRoot },
  // Its own type check, so the dev server's leftover route types (which still
  // list the form endpoints) cannot fail it.
  typescript: { tsconfigPath: 'tsconfig.static.json' },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/staticImageLoader.ts',
    ...staticImageWidths,
  },
};

/*
 * `next dev` writes to .next-dev, `next build` / `next start` to .next. Sharing
 * one folder, a build run while the dev server was up overwrote the dev
 * server's files and the dev server overwrote the build's: pages then failed
 * with missing stylesheets, 404s and crashed workers on the local build.
 */
export default function config(phase) {
  if (isStatic) return staticConfig;
  return phase === PHASE_DEVELOPMENT_SERVER ? { ...nextConfig, distDir: '.next-dev' } : nextConfig;
}
