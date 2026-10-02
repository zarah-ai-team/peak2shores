/**
 * Whether this build is the public site.
 *
 * Vercel sets VERCEL_ENV ('production' | 'preview' | 'development') and Netlify
 * sets CONTEXT ('production' | 'deploy-preview' | 'branch-deploy'). Preview and
 * staging copies must never be indexed, or Google would list them beside the
 * real site. Outside either host (local builds) the build counts as
 * production, so nothing changes when testing locally.
 */
export const isProduction = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : !process.env.CONTEXT || process.env.CONTEXT === 'production';
