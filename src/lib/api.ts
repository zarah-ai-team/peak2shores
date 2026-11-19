import { NextResponse } from 'next/server';

/**
 * Shared guards for the two form endpoints.
 *
 * These are a marketing site's forms, not an API: the only legitimate caller
 * is the site's own page. So a request must come from this origin, must be
 * small, must be JSON, and must not arrive in bursts.
 *
 * The rate limiter is in-memory — right for a single self-hosted instance,
 * which is what `next start` is. On a multi-instance or serverless host the
 * counters are per instance and the limit is correspondingly looser; put a
 * platform limiter (or a shared store) in front of it there.
 *
 * VERCEL, where the site runs (and Netlify alike): each route handler runs as
 * a serverless function. Every warm instance keeps its own Map, a cold start
 * begins empty, and concurrent instances do not share counts — so "5 per
 * minute" is per instance: a best-effort brake on one bursty client, not a
 * guarantee. For a hard limit add a Vercel Firewall rate-limit rule on /api/*
 * (a Netlify rate-limit rule there), or back `tooManyRequests` with a shared
 * store.
 */

/** Largest body either form can legitimately produce, with room to spare. */
const MAX_BODY_BYTES = 16 * 1024;

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientKey(request: Request) {
  // Key only on an address the host writes itself. Vercel, where the site
  // runs, sets x-real-ip and x-forwarded-for on every request and overwrites
  // any value the client sends. x-nf-client-connection-ip is set only by
  // Netlify's edge; anywhere else the client chooses it, so it is read on
  // Netlify only. Without an address (an empty header counts as none), every
  // request shares one bucket, so the limit still applies.
  const h = request.headers;
  if (process.env.NETLIFY === 'true') {
    return h.get('x-nf-client-connection-ip')?.trim() || 'anonymous';
  }
  return (
    h.get('x-real-ip')?.trim() || h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous'
  );
}

/** True when this client has already sent more than the window allows. */
export function tooManyRequests(request: Request, scope: string) {
  const now = Date.now();
  const key = `${scope}:${clientKey(request)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    // Keep the map from growing without bound between windows.
    if (buckets.size > 10_000) {
      for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    }
    return false;
  }

  bucket.count += 1;
  return bucket.count > MAX_PER_WINDOW;
}

/**
 * The request must be a same-origin fetch. Modern browsers send
 * `Sec-Fetch-Site` on every request; when present it is authoritative.
 * Otherwise fall back to comparing Origin with Host.
 */
export function sameOrigin(request: Request) {
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite) return fetchSite === 'same-origin' || fetchSite === 'none';

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!origin || !host) return true; // non-browser client with no Origin: nothing to forge
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

type Body = { ok: true; value: Record<string, unknown> } | { ok: false; response: NextResponse };

/** A bounded, JSON-only body. */
export async function readJsonBody(request: Request): Promise<Body> {
  const type = request.headers.get('content-type') ?? '';
  if (!type.toLowerCase().startsWith('application/json')) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Expected JSON.' }, { status: 415 }),
    };
  }

  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Request too large.' }, { status: 413 }),
    };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Malformed request.' }, { status: 400 }),
    };
  }
  // Bytes, not UTF-16 units: accented text is longer on the wire than .length.
  if (new TextEncoder().encode(text).byteLength > MAX_BODY_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Request too large.' }, { status: 413 }),
    };
  }

  try {
    const value: unknown = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('shape');
    return { ok: true, value: value as Record<string, unknown> };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Malformed request.' }, { status: 400 }),
    };
  }
}

/** A bounded, trimmed string field, or undefined. */
export function text(value: unknown, max: number): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim().slice(0, max);
  return trimmed || undefined;
}

const SOURCE_KEYS = [
  'source',
  'medium',
  'campaign',
  'term',
  'content',
  'gclid',
  'fbclid',
  'referrer',
  'landing',
  'at',
] as const;

/**
 * The first-touch record a form sends (see lib/attribution). Only known keys,
 * only short strings — it arrives from the browser, so it is treated as input.
 */
export function readSource(value: unknown): Partial<Record<(typeof SOURCE_KEYS)[number], string>> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const record = value as Record<string, unknown>;
  const out: Partial<Record<(typeof SOURCE_KEYS)[number], string>> = {};
  for (const key of SOURCE_KEYS) {
    const v = text(record[key], 300);
    if (v) out[key] = v;
  }
  return out;
}
