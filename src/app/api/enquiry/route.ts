import { NextResponse } from 'next/server';
import { getEnquirableJourneyTitles, getSiteSettings } from '@/lib/content';
import { readJsonBody, readSource, sameOrigin, text, tooManyRequests } from '@/lib/api';
import { deliver, isDeliveryConfigured } from '@/lib/delivery';

/**
 * Journey enquiries.
 *
 * Validated, bounded and rate-limited here, then handed to `deliver()` in
 * src/lib/delivery.ts, which forwards to ENQUIRY_WEBHOOK_URL when it is set.
 *
 * The response is truthful about delivery:
 *   200 { ok: true, delivered: true }   — accepted and forwarded
 *   200 { ok: true, delivered: false }  — accepted, but NO delivery is
 *                                         configured: the enquiry exists only
 *                                         as an anonymous log line. Launch
 *                                         blocker until the env var is set.
 *   502 { error }                        — a configured provider failed; the
 *                                         form shows its "email us" fallback.
 * Logs never carry the person's details.
 */

const PARTY = new Set(['Couple', 'Friends', 'Family', 'Solo']);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
    return NextResponse.json({ error: 'A name is required.' }, { status: 422 });
  }
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 422 });
  }

  const result = await deliver('enquiry', {
    name,
    email,
    phone,
    party,
    guests,
    journey,
    travelWindow,
    heardFrom,
    notes,
    source,
  });

  // Logs carry no personal data — only that an enquiry arrived, for what,
  // which channel brought the traveller in, and whether it went anywhere.
  console.info('[peaks2shores] enquiry received', {
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
