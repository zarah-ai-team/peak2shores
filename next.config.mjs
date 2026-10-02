/** @type {import('next').NextConfig} */

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
const legacyRedirects = [
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

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // WebP only. AVIF is smaller but several times slower to encode, and on a
    // small instance with a cold cache that encode is what keeps a page of
    // photographs blank.
    formats: ['image/webp'],
    // The editorial grid tops out at a 1440-wide canvas with full-bleed
    // heroes. Sources are 2400px wide, so a 2560 variant would only re-encode
    // the original at full size.
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920],
    // Next's default is 60 seconds, so browsers and the CDN come back for every
    // photograph almost immediately. Files in public/images are replaced by
    // name rarely enough that a month is safe.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  async headers() {
    const headers = isProduction
      ? securityHeaders
      : [...securityHeaders, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }];
    return [{ source: '/(.*)', headers }];
  },
  async redirects() {
    return legacyRedirects.map((r) => ({ ...r, statusCode: 301 }));
  },
};

export default nextConfig;
