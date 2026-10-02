/**
 * Where a visitor first came from — Instagram, Google, an email, an ad.
 *
 * Captured once, on the first page of the first visit, and kept for 90 days in
 * a first-party cookie, so an enquiry sent a week later is still credited to
 * the post or ad that brought the traveller in (first touch). Sent with every
 * form, stored with the enquiry, and never shown to the visitor.
 */
export type FirstTouch = {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
  /** Google Ads and Meta click IDs, for matching conversions later. */
  gclid?: string;
  fbclid?: string;
  /** The external page that linked here, if there was one. */
  referrer?: string;
  /** The first page seen on this site. */
  landing: string;
  /** When, as an ISO timestamp. */
  at: string;
};

const COOKIE = 'p2s_src';
const MAX_AGE = 60 * 60 * 24 * 90;

function readCookie(): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/** Record the first touch, unless one is already on file. */
export function captureFirstTouch() {
  if (typeof document === 'undefined' || readCookie()) return;

  const params = new URLSearchParams(window.location.search);
  const get = (key: string) => params.get(key)?.slice(0, 200) || undefined;

  let referrer: string | undefined;
  try {
    if (document.referrer && new URL(document.referrer).host !== window.location.host) {
      referrer = document.referrer.slice(0, 300);
    }
  } catch {
    // An unparseable referrer is no referrer.
  }

  const touch: FirstTouch = {
    source: get('utm_source'),
    medium: get('utm_medium'),
    campaign: get('utm_campaign'),
    term: get('utm_term'),
    content: get('utm_content'),
    gclid: get('gclid'),
    fbclid: get('fbclid'),
    referrer,
    landing: window.location.pathname,
    at: new Date().toISOString(),
  };

  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(touch))}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

export function readFirstTouch(): FirstTouch | null {
  if (typeof document === 'undefined') return null;
  try {
    const raw = readCookie();
    return raw ? (JSON.parse(raw) as FirstTouch) : null;
  } catch {
    return null;
  }
}
