/**
 * What to tell the reader when a form endpoint says no.
 *
 * The endpoints answer a refusal with `{ error }` in plain words — a bad
 * address, too many attempts. Those are worth showing as they are: "please try
 * again" is wrong when trying again cannot work. Anything else (a 500, a body
 * that is not JSON) falls back to the form's own message.
 */
export async function failureMessage(res: Response): Promise<string> {
  if (res.status !== 422 && res.status !== 429) return '';
  try {
    const body: unknown = await res.json();
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      return body.error;
    }
  } catch {
    // Not JSON. Fall through to the generic message.
  }
  return '';
}

/**
 * Send a form to its endpoint.
 *
 * The static build has no endpoints, so there it answers as the server does
 * when nothing is wired to receive the form (`delivered: false`): the form
 * then shows what was entered and offers it as a ready-written email, rather
 * than claiming something was sent.
 */
export async function postForm(path: string, body: unknown): Promise<Response> {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === '1') {
    return new Response(JSON.stringify({ ok: true, delivered: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/**
 * The tick box under a Circle sign-up field, in the words the visitor reads:
 * the box's label ("I agree to the Privacy Policy"), then "Unsubscribe at any
 * time." beside it. The form builds its line from these parts and shows
 * `unticked` under the box when a sign-up is sent without the tick;
 * /api/subscribe refuses such a sign-up with the same words, and sends the
 * sentence the visitor ticked on with each sign-up, so the mailing list can
 * hold what was agreed to. Change the wording here and both follow.
 */
export const circleConsent = {
  before: 'I agree to the',
  policy: { label: 'Privacy Policy', href: '/privacy' },
  after: 'Unsubscribe at any time.',
  unticked: 'Please tick the box to agree to the Privacy Policy.',
} as const;

/** What the visitor ticked, as one sentence, for the sign-up's record. */
export const circleConsentText = `${circleConsent.before} ${circleConsent.policy.label}. ${circleConsent.after}`;

/**
 * The tick box at the foot of a journey page's pop-up forms (the inquiry and
 * the two booking requests), in the words the visitor reads. The form builds
 * its label from these parts, and /api/enquiry sends the same sentence on with
 * each request as its record of consent. Change the wording here and both
 * follow.
 */
export const privacyConsent = {
  before: 'I agree to the',
  policy: { label: 'Privacy Policy', href: '/privacy' },
} as const;

/** The tick box's label as one sentence, for the request's record. */
export const privacyConsentText = `${privacyConsent.before} ${privacyConsent.policy.label}.`;

/**
 * The longest value each field of the journey pop-up forms may hold. The
 * fields stop there, and /api/enquiry cuts anything longer to the same size.
 */
export const journeyFormLimits = {
  name: 200,
  email: 254,
  /** The number as typed, without the country code. */
  phoneNumber: 30,
  /** The whole number with its country code, as the request carries it. */
  phone: 40,
  dates: 120,
  notes: 2000,
} as const;

/** The two rooms a booking request can ask for. */
export const roomOptions = ['Double', 'Single'] as const;
export type RoomOption = (typeof roomOptions)[number];

/** An email address in the shape name@example.com: what the forms and the routes accept. */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * A phone number in international form: "+", the country code, then the
 * number, with spaces, dots, dashes or brackets allowed between the digits.
 * Returns it with its spaces tidied, or null when it cannot be a phone number:
 * with its country code a number has from 7 to 15 digits (ITU E.164).
 */
export function internationalPhone(value: string): string | null {
  const phone = value.trim().replace(/\s+/g, ' ');
  if (phone.length > journeyFormLimits.phone || !/^\+[\d\s().-]+$/.test(phone)) return null;
  const digits = phone.replace(/\D/g, '').length;
  return digits >= 7 && digits <= 15 ? phone : null;
}
