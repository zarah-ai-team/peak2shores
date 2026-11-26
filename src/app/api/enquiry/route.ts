import { NextResponse } from 'next/server';
import { getEnquirableJourneyTitles, getJourneys, getSiteSettings } from '@/lib/content';
import { readJsonBody, readSource, sameOrigin, text, tooManyRequests } from '@/lib/api';
import { deliver, isDeliveryConfigured, type EnquiryFormId } from '@/lib/delivery';
import {
  EMAIL_PATTERN,
  internationalPhone,
  journeyFormLimits as limits,
  privacyConsent,
  privacyConsentText,
  roomOptions,
} from '@/lib/forms';

/**
 * Inquiries and booking requests.
 *
 * Two kinds of form post here:
 * - the inquiry form on /plan, which sends no `form` field, and `consent: true`
 *   for its Privacy Policy tick box;
 * - a journey page's three pop-ups, which send `form`: 'enquiry' ("Make an
 *   inquiry"), 'group' ("Book this journey") or 'private' ("Book as a
 *   private journey"), with the journey's `slug`, the `page` they were sent
 *   from and `consent: true` for the Privacy Policy tick box.
 *
 * Each is validated, bounded and rate-limited here, then handed to `deliver()`
 * in src/lib/delivery.ts, which forwards it to ENQUIRY_WEBHOOK_URL when that is
 * set. The payload's `form` says which form it came from.
 *
 * The response is truthful about delivery:
 *   200 { ok: true, delivered: true }   — accepted and forwarded
 *   200 { ok: true, delivered: false }  — accepted, but NO delivery is
 *                                         configured: the request exists only
 *                                         as an anonymous log line. Launch
 *                                         blocker until the env var is set.
 *   422 { error }                        — a field is missing or not valid; the
 *                                         error is a sentence the form shows.
 *   502 { error }                        — a configured provider failed; the
 *                                         form shows its "email us" fallback.
 * Logs never carry the person's details.
 */

const PARTY = new Set(['Couple', 'Friends', 'Family', 'Solo']);

/** The journey forms' `form` values, and what each is called in the payload. */
const JOURNEY_FORMS = {
  enquiry: 'journey-enquiry',
  group: 'group-booking',
  private: 'private-booking',
} as const satisfies Record<string, EnquiryFormId>;

type JourneyFormKind = keyof typeof JOURNEY_FORMS;

function isJourneyForm(value: unknown): value is JourneyFormKind {
  return typeof value === 'string' && Object.hasOwn(JOURNEY_FORMS, value);
}

/** A path on this site (`/journeys/swiss-elegance`), or undefined. */
function sitePath(value: unknown) {
  const path = text(value, 200);
  return path && /^\/(?!\/)[\w\-./]*$/.test(path) ? path : undefined;
}

/** An http(s) address's origin (`https://example.com`), or undefined. */
function webOrigin(value: string | null | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : undefined;
  } catch {
    return undefined;
  }
}

/**
 * The address the visitor sent the form from, for the "Page" link in the
 * team's email: the site answers at more than one address, and the link
 * should open the page that was on screen. It is the Origin the browser sent
 * with the request when that names the host the request reached (so a forged
 * Origin is not taken), else the address the request reached, else the
 * site's own.
 */
function requestOrigin(request: Request, fallback: string) {
  const origin = webOrigin(request.headers.get('origin'));
  const host = request.headers.get('host');
  if (origin && host && new URL(origin).host === host) return origin;
  return webOrigin(request.url) ?? fallback;
}

function refuse(error: string) {
  return NextResponse.json({ error }, { status: 422 });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }
  if (tooManyRequests(request, 'enquiry')) {
    return NextResponse.json({ error: 'Please try again in a minute.' }, { status: 429 });
  }

  const body = await readJsonBody(request);
  if (!body.ok) return body.response;
  const data = body.value;

  // Honeypot: a real browser never fills it. Answer exactly as a success
  // would, so the bot learns nothing.
  if (typeof data.website === 'string' && data.website.trim() !== '') {
    return NextResponse.json({ ok: true, delivered: isDeliveryConfigured('enquiry') });
  }

  if (data.form === undefined) return planEnquiry(data);
  if (isJourneyForm(data.form)) return journeyRequest(data.form, data, request);
  return refuse('This form could not be sent. Please email us instead.');
}

/**
 * The inquiry form on /plan. As with the pop-ups, a request without the
 * Privacy Policy box ticked is refused before anything is delivered.
 */
async function planEnquiry(data: Record<string, unknown>) {
  const [site, journeyTitles] = await Promise.all([
    getSiteSettings(),
    getEnquirableJourneyTitles(),
  ]);

  const name = typeof data.name === 'string' ? data.name.trim().slice(0, 200) : '';
  const email = typeof data.email === 'string' ? data.email.trim().slice(0, 254) : '';
  const party = typeof data.party === 'string' && PARTY.has(data.party) ? data.party : undefined;
  const journey =
    typeof data.journey === 'string' && journeyTitles.includes(data.journey)
      ? data.journey
      : undefined;
  const notes = typeof data.notes === 'string' ? data.notes.trim().slice(0, 2000) : '';
  const phoneRaw = text(data.phone, 40);
  const phone = phoneRaw && /^[+()\d\s.-]{6,40}$/.test(phoneRaw) ? phoneRaw : undefined;
  const travelWindow = text(data.travelWindow, 120);
  const heardFrom = text(data.heardFrom, 120);
  const source = readSource(data.source);
  const guestsRaw = typeof data.guests === 'string' ? Number(data.guests) : data.guests;
  const guests =
    typeof guestsRaw === 'number' &&
    Number.isInteger(guestsRaw) &&
    guestsRaw >= 1 &&
    guestsRaw <= site.maxGuests
      ? guestsRaw
      : undefined;

  if (!name) {
    return refuse('A name is required.');
  }
  if (!EMAIL_PATTERN.test(email)) {
    return refuse('A valid email address is required.');
  }
  if (data.consent !== true) return refuse(privacyConsent.unticked);

  const result = await deliver('enquiry', {
    form: 'plan',
    subject: `Inquiry: ${journey ?? 'a private journey'}`,
    name,
    email,
    phone,
    party,
    guests,
    journey,
    travelWindow,
    heardFrom,
    notes,
    // The tick box's sentence and the policy it names: the record of consent.
    consent: { statement: privacyConsentText, policy: privacyConsent.policy.href },
    source,
  });

  // Logs carry no personal data — only that an inquiry arrived, for what,
  // which channel brought the traveler in, and whether it went anywhere.
  console.info('[peaks2shores] inquiry received', {
    form: 'plan',
    journey: journey ?? 'private',
    party,
    guests,
    hasNotes: notes.length > 0,
    hasPhone: Boolean(phone),
    travelWindow,
    heardFrom,
    utm: [source.source, source.medium, source.campaign].filter(Boolean).join(' / ') || undefined,
    referrer: source.referrer,
    delivered: result.delivered,
    at: new Date().toISOString(),
  });

  if (!result.delivered && result.reason === 'failed') {
    return NextResponse.json(
      { error: `That didn’t send. Please email ${site.email}.` },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, delivered: result.delivered });
}

/**
 * A journey page's pop-ups. The journey is read from the catalog by its slug,
 * so the request names it as the site does, whatever the page sent; the type
 * (group or private) is the form itself. The refusals are the sentences the
 * forms show beside their fields, for a browser that skipped those checks.
 * The page's full address is built on the address the visitor was on.
 */
async function journeyRequest(
  kind: JourneyFormKind,
  data: Record<string, unknown>,
  request: Request,
) {
  const [site, journeys] = await Promise.all([getSiteSettings(), getJourneys()]);

  const slug = text(data.slug, 120);
  const journey = slug ? journeys.find((j) => j.slug === slug) : undefined;
  const booking = kind !== 'enquiry';

  const name = text(data.name, limits.name) ?? '';
  const email = text(data.email, limits.email) ?? '';
  const phoneRaw = text(data.phone, limits.phone);
  const phone = phoneRaw ? internationalPhone(phoneRaw) : null;
  const guestsRaw =
    typeof data.guests === 'string' && data.guests.trim() !== ''
      ? Number(data.guests)
      : data.guests;
  const guests = booking && typeof guestsRaw === 'number' ? guestsRaw : undefined;
  const room = roomOptions.find((option) => option === data.room);
  const departure = booking ? text(data.departure, limits.dates) : undefined;
  const travelWindow = booking ? text(data.dates, limits.dates) : undefined;
  const notes = text(data.notes, limits.notes) ?? '';
  const page = sitePath(data.page);
  const source = readSource(data.source);

  if (!journey) {
    return refuse(`This journey can’t be requested here just now. Please email ${site.email}.`);
  }
  if (!name) return refuse('Please enter your name.');
  if (!EMAIL_PATTERN.test(email)) {
    return refuse('Please enter an email address like name@example.com.');
  }
  if (booking && !phoneRaw) return refuse('Please enter your phone number.');
  if (phoneRaw && !phone) {
    return refuse(
      'Please check the phone number. Use digits, and choose the country code beside it.',
    );
  }
  if (booking && guests === undefined) return refuse('Please enter the number of guests.');
  if (guests !== undefined && !(Number.isInteger(guests) && guests >= 1)) {
    return refuse('Please enter a whole number, 1 or more.');
  }
  if (guests !== undefined && guests > site.maxGuests) {
    return refuse(`For a larger party, please write to us at ${site.email}.`);
  }
  if (data.consent !== true) return refuse(privacyConsent.unticked);

  const form = JOURNEY_FORMS[kind];
  const subject =
    kind === 'enquiry'
      ? `Inquiry: ${journey.title}`
      : `${kind === 'group' ? 'Group' : 'Private'} booking request: ${journey.title}`;

  const result = await deliver('enquiry', {
    form,
    subject,
    name,
    email,
    phone: phone ?? undefined,
    guests,
    journey: journey.title,
    journeySlug: journey.slug,
    journeyType: booking ? kind : undefined,
    departure,
    travelWindow,
    room: booking ? room : undefined,
    notes,
    page,
    pageUrl: page ? `${requestOrigin(request, site.url)}${page}` : undefined,
    consent: { statement: privacyConsentText, policy: privacyConsent.policy.href },
    source,
  });

  // No personal data: which form, which journey, the shape of the request,
  // the channel that brought the traveler in, and whether it went anywhere.
  console.info('[peaks2shores] journey request received', {
    form,
    journey: journey.slug,
    guests,
    room: booking ? room : undefined,
    hasDeparture: Boolean(departure),
    hasDates: Boolean(travelWindow),
    hasNotes: notes.length > 0,
    hasPhone: Boolean(phone),
    page,
    utm: [source.source, source.medium, source.campaign].filter(Boolean).join(' / ') || undefined,
    referrer: source.referrer,
    delivered: result.delivered,
    at: new Date().toISOString(),
  });

  if (!result.delivered && result.reason === 'failed') {
    return NextResponse.json(
      { error: `That didn’t send. Please email ${site.email}.` },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, delivered: result.delivered });
}
