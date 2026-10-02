import { NextResponse } from 'next/server';
import { liveJourneys } from '@/lib/journeys';
import { site } from '@/lib/site';
import { readJsonBody, readSource, sameOrigin, text, tooManyRequests } from '@/lib/api';

/**
 * Journey enquiries.
 *
 * INTEGRATION POINT — before launch, forward this to Marc's inbox and the CRM.
 * The endpoint validates, bounds and rate-limits; wiring the delivery is a
 * one-file change. Until then a submission is acknowledged and logged as an
 * opaque event — never with the person's details.
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

  // Honeypot: a real browser never fills it. Say "ok" so the bot learns nothing.
  if (typeof data.website === 'string' && data.website.trim() !== '') {
    return NextResponse.json({ ok: true });
  }

  const name = typeof data.name === 'string' ? data.name.trim().slice(0, 200) : '';
  const email = typeof data.email === 'string' ? data.email.trim().slice(0, 254) : '';
  const party = typeof data.party === 'string' && PARTY.has(data.party) ? data.party : undefined;
  const journey =
    typeof data.journey === 'string' && liveJourneys().some((j) => j.title === data.journey)
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

  // TODO(launch): deliver { name, email, phone, party, guests, journey,
  // travelWindow, heardFrom, notes, source } to the shared inbox / CRM.
  // Logs carry no personal data — only that an enquiry arrived, for what, and
  // which channel brought the traveller in.
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
    at: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
