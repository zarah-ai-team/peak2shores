import { NextResponse } from 'next/server';
import { readJsonBody, readSource, sameOrigin, tooManyRequests } from '@/lib/api';
import { deliver, isDeliveryConfigured } from '@/lib/delivery';

/**
 * "Join the circle" sign-ups.
 *
 * Validated, bounded and rate-limited here, then handed to `deliver()` in
 * src/lib/delivery.ts, which forwards to SUBSCRIBE_WEBHOOK_URL when it is set.
 * The mailing provider behind that webhook must run double opt-in.
 *
 * Responses mirror /api/enquiry: `{ ok: true, delivered }` (delivered: false
 * means nothing was stored anywhere — set the env var before launch), or 502
 * when a configured provider fails. The log records the event and channel,
 * never the address.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }
  if (tooManyRequests(request, 'subscribe')) {
    return NextResponse.json({ error: 'Please try again in a minute.' }, { status: 429 });
  }

  const body = await readJsonBody(request);
  if (!body.ok) return body.response;

  // Honeypot, should a form ever send one: answer as a success would.
  if (typeof body.value.website === 'string' && body.value.website.trim() !== '') {
    return NextResponse.json({ ok: true, delivered: isDeliveryConfigured('subscription') });
  }

  const email = typeof body.value.email === 'string' ? body.value.email.trim().slice(0, 254) : '';
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 422 });
  }

  const source = readSource(body.value.source);
  const result = await deliver('subscription', { email, source });

  console.info('[peaks2shores] circle sign-up received', {
    utm: [source.source, source.medium, source.campaign].filter(Boolean).join(' / ') || undefined,
    delivered: result.delivered,
    at: new Date().toISOString(),
  });

  if (!result.delivered && result.reason === 'failed') {
    return NextResponse.json(
      { error: 'That didn’t go through. Please try again later.' },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true, delivered: result.delivered });
}
