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
 */

/** Largest body either form can legitimately produce, with room to spare. */
const MAX_BODY_BYTES = 16 * 1024;

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function clientKey(request: Request) {
  // Behind a proxy the first forwarded address is the client's; without one,
  // fall back to a single shared bucket so the limit still applies.
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous';
  return ip;
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
  if (text.length > MAX_BODY_BYTES) {
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
