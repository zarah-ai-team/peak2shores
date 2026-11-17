import { NextResponse } from 'next/server';
import { readJsonBody, readSource, sameOrigin, text, tooManyRequests } from '@/lib/api';
import { deliver, isDeliveryConfigured } from '@/lib/delivery';
import { circleConsent, circleConsentText } from '@/lib/forms';

/**
 * "Join the circle" sign-ups.
 *
 * Validated, bounded and rate-limited here, then handed to `deliver()` in
 * src/lib/delivery.ts, which forwards to SUBSCRIBE_WEBHOOK_URL when it is set.
 * The mailing provider behind that webhook must run double opt-in: the form
 * tells a new subscriber to confirm from their inbox. Its confirmation email
 * and the unsubscribe link in every email are the provider's to send.
 *
 * Each sign-up carries its record of consent: the line shown under the field
 * (lib/forms) and the page the form stood on.
 *
 * Responses mirror /api/enquiry: `{ ok: true, delivered }` (delivered: false
 * means nothing was stored anywhere — set the env var before launch), or 502
 * when a configured provider fails. The log records the event and channel,
 * never the address.
 */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** A path on this site (`/`, `/journal`), or undefined. */
function sitePath(value: unknown) {
  const path = text(value, 200);
  return path && /^\/(?!\/)[\w\-./]*$/.test(path) ? path : undefined;
}

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
  // The record of consent: the line the form showed, and the page it stood on.
  // Both arrive from the browser, so only a flag and a short site path are read.
  const consent =
    body.value.consent === true
      ? { statement: circleConsentText, policy: circleConsent.policy.href }
      : undefined;
  const result = await deliver('subscription', {
    email,
    source,
    page: sitePath(body.value.page),
    consent,
  });

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
