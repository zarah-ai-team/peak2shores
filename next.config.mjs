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

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Real destination photography will be served from these sizes; the
    // editorial grid tops out at a 1440-wide canvas with full-bleed heroes.
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920, 2560],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
