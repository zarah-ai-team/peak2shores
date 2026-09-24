import { NextResponse } from 'next/server';
import { readJsonBody, sameOrigin, tooManyRequests } from '@/lib/api';

/**
 * "Join the circle" sign-ups.
 *
 * INTEGRATION POINT — before launch, replace the log line with a call to the
 * chosen mailing provider (or the CRM). The endpoint validates, bounds and
 * rate-limits; the wiring is a one-file change.
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

  const email = typeof body.value.email === 'string' ? body.value.email.trim().slice(0, 254) : '';
  if (!EMAIL.test(email)) {
    return NextResponse.json({ error: 'A valid email address is required.' }, { status: 422 });
  }

  // TODO(launch): subscribe `email`. The log records the event, not the address.
  console.info('[peaks2shores] circle sign-up received', { at: new Date().toISOString() });

  return NextResponse.json({ ok: true });
}
