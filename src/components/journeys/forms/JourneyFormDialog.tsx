'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { track } from '@/lib/analytics';
import { readFirstTouch } from '@/lib/attribution';
import {
  EMAIL_PATTERN,
  failureMessage,
  internationalPhone,
  journeyFormLimits as limits,
  postForm,
  privacyConsent,
  roomOptions,
  type RoomOption,
} from '@/lib/forms';
import { site } from '@/lib/site';
import { defaultDialCountry, dialCodeOf, dialCodes } from './dialCodes';
import type { JourneyFormKind, JourneyRef } from './JourneyForms';
import './journey-forms.css';

/** One press of a button that opens a form: which form, and the departure it named. */
export type FormRequest = { kind: JourneyFormKind; departure?: string; n: number };

const FIRST_NAME = site.founder.name.split(' ')[0];

/** Each form's words. The type (group or private) is the form itself. */
const COPY: Record<
  JourneyFormKind,
  {
    title: string;
    about: string;
    type?: string;
    intro: string;
    send: string;
    email: string;
  }
> = {
  enquiry: {
    title: 'Make an inquiry',
    about: 'Inquiring about',
    intro: `Inquiring holds nothing and commits you to nothing — it starts a conversation with ${FIRST_NAME}.`,
    send: 'Send inquiry',
    email: 'Email your inquiry',
  },
  group: {
    title: 'Book this journey',
    about: 'Journey',
    type: 'Group journey',
    intro: `Sending a request commits you to nothing. ${FIRST_NAME} will reply personally to confirm availability; a deposit then holds your place.`,
    send: 'Send booking request',
    email: 'Email your request',
  },
  private: {
    title: 'Book as a private journey',
    about: 'Journey',
    type: 'Private journey',
    intro:
      'The same hotels and the same people on the ground, for your party alone and on your own dates. Sending a request commits you to nothing.',
    send: 'Send booking request',
    email: 'Email your request',
  },
};

type Values = {
  name: string;
  email: string;
  /** The ISO code of the country whose calling code the phone number follows. */
  country: string;
  /** The number as typed, without the calling code. */
  phone: string;
  guests: string;
  /** The value of a departure from the journey's dates, or '' for none. */
  departure: string;
  dates: string;
  room: RoomOption | '';
  /** Each form's own note: what is written to one form is not carried to another. */
  notes: Record<JourneyFormKind, string>;
  consent: boolean;
};

/** The fields a check can find wrong, in the order they stand in the form. */
const CHECKED = ['name', 'email', 'phone', 'guests', 'consent'] as const;
type Checked = (typeof CHECKED)[number];
type Errors = Partial<Record<Checked, string>>;

/**
 * idle → sending → one of:
 *   sent         the route accepted it AND forwarded it (`delivered: true`)
 *   undelivered  the route accepted it but nothing is set up to receive it
 *                (`delivered: false`), so the form says so and offers the
 *                same details as a ready-written email
 *   error        refused (422 or 429) or the provider failed (502)
 */
type Status = 'idle' | 'sending' | 'sent' | 'undelivered' | 'error';

/** What was sent, kept for the result: the form, the email's subject and its lines. */
type Sent = { kind: JourneyFormKind; subject: string; lines: [string, string][] };

/** The number with its calling code: as typed when it starts with "+" or "00". */
function fullPhone(country: string, number: string) {
  const typed = number.trim();
  if (typed.startsWith('+')) return typed;
  if (typed.startsWith('00')) return `+${typed.slice(2)}`;
  return `+${dialCodeOf(country)[2]} ${typed}`;
}

function check(kind: JourneyFormKind, values: Values): Errors {
  const booking = kind !== 'enquiry';
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = 'Please enter your name.';
  const email = values.email.trim();
  if (!email) errors.email = 'Please enter your email address.';
  else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter an email address like name@example.com.';
  }
  if (!values.phone.trim()) {
    if (booking) errors.phone = 'Please enter your phone number.';
  } else if (!internationalPhone(fullPhone(values.country, values.phone))) {
    errors.phone = 'Please check the number. Use digits, and choose the country code beside it.';
  }
  if (booking) {
    const typed = values.guests.trim();
    const guests = Number(typed);
    if (!typed) errors.guests = 'Please enter the number of guests.';
    else if (!Number.isInteger(guests) || guests < 1) {
      errors.guests = 'Please enter a whole number, 1 or more.';
    } else if (guests > site.maxGuests) {
      errors.guests = `For a larger party, please write to us at ${site.email}.`;
    }
  }
  if (!values.consent) errors.consent = 'Please tick the box to agree to the Privacy Policy.';
  return errors;
}

/**
 * The three pop-up forms of a journey's page, in one dialog: "Make an
 * inquiry", "Book this journey" (the group departure) and "Book as a private
 * journey". The button that opens it chooses the form, so the journey and the
 * type are shown at the top and sent with the request, never asked for.
 *
 * What is typed stays while the page is open: a form closed by mistake opens
 * again as it was. The name, email and phone carry to every form, and the
 * guests, dates and room between the two booking forms; each form keeps its
 * own note. After a request is sent the form keeps the name, email and phone,
 * and clears the rest of what was sent.
 *
 * Checks run when the form is sent: the first field that needs attention
 * takes focus, each says what is wrong beneath it, and from then on each
 * check follows the typing. The result never claims more than the route
 * confirmed: when nothing was delivered, the reader is told so and offered
 * the same details as a ready-written email (the plan page's form does the
 * same). No email goes to the traveler from here; that waits for an email
 * service.
 */
export function JourneyFormDialog({
  journey,
  request,
  open,
  onClose,
  returnFocus,
}: {
  journey: JourneyRef;
  request: FormRequest;
  open: boolean;
  onClose: () => void;
  returnFocus: RefObject<HTMLElement | null>;
}) {
  const departureOf = (value: string | undefined) =>
    journey.departures?.find((d) => d.value === value)?.value ?? '';

  const [values, setValues] = useState<Values>(() => ({
    name: '',
    email: '',
    country: defaultDialCountry(),
    phone: '',
    guests: '',
    departure: request.kind === 'group' ? departureOf(request.departure) : '',
    dates: '',
    room: '',
    notes: { enquiry: '', group: '', private: '' },
    consent: false,
  }));
  const [errors, setErrors] = useState<Errors>({});
  /** True once a send has been tried: the checks then follow the typing. */
  const [tried, setTried] = useState(false);
  const [summary, setSummary] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');
  const [sent, setSent] = useState<Sent | null>(null);
  /** True once the result has been on screen, so the next opening returns to the form. */
  const [seen, setSeen] = useState(false);

  // Each press of a button is a new request: the form opens afresh, keeping
  // what was typed. A result not yet seen (the dialog was closed while it
  // sent) is shown first. The Privacy Policy box is ticked for one form only:
  // another form opens with it clear.
  const [last, setLast] = useState({ n: request.n, kind: request.kind });
  if (last.n !== request.n) {
    setLast({ n: request.n, kind: request.kind });
    if (status === 'error' || ((status === 'sent' || status === 'undelivered') && seen)) {
      setStatus('idle');
      setSeen(false);
    }
    setErrors({});
    setTried(false);
    setSummary('');
    setServerError('');
    const departure = request.kind === 'group' ? departureOf(request.departure) : '';
    const otherForm = request.kind !== last.kind;
    if (departure || otherForm) {
      setValues((v) => ({
        ...v,
        departure: departure || v.departure,
        consent: otherForm ? false : v.consent,
      }));
    }
  }

  // While a request is on its way, or its result is showing, the dialog keeps
  // to the form that sent it.
  const kind =
    status === 'idle' || status === 'error' ? request.kind : (sent?.kind ?? request.kind);
  const copy = COPY[kind];
  const booking = kind !== 'enquiry';
  const departures = kind === 'group' ? (journey.departures ?? []) : [];
  const sending = status === 'sending';

  const uid = useId();
  const id = (field: string) => `${uid}-${field}`;
  const aboutId = id('about');
  /** A field the check found wrong is marked so, and described by its error.
      Any other is marked valid outright: a browser would otherwise announce
      the required tick box as invalid before anything has been sent. */
  const invalid = (field: Checked) =>
    errors[field]
      ? { 'aria-invalid': true as const, 'aria-describedby': `${id(field)}-error` }
      : { 'aria-invalid': false as const };

  const refs = {
    name: useRef<HTMLInputElement>(null),
    email: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    guests: useRef<HTMLInputElement>(null),
    consent: useRef<HTMLInputElement>(null),
  } satisfies Record<Checked, RefObject<HTMLInputElement | null>>;
  const honeypot = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  // With a finger the dialog opens on its title, so the keyboard does not
  // cover the form before it has been read; with a mouse, in the first field.
  const [coarse] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  );

  const result = status === 'sent' || status === 'undelivered';
  useEffect(() => {
    if (!open || !result) return;
    setSeen(true);
    resultRef.current?.focus();
  }, [open, result]);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    const next = { ...values, [key]: value };
    setValues(next);
    if (!tried) return;
    const found = check(kind, next);
    setErrors(found);
    if (CHECKED.every((field) => !found[field])) setSummary('');
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;

    const found = check(kind, values);
    const wrong = CHECKED.filter((field) => found[field]);
    setErrors(found);
    setTried(true);
    setServerError('');
    if (wrong.length > 0) {
      setSummary(
        wrong.length === 1
          ? 'Please check the field marked above.'
          : `Please check the ${wrong.length} fields marked above.`,
      );
      refs[wrong[0]].current?.focus();
      return;
    }
    setSummary('');

    const phone = values.phone.trim()
      ? (internationalPhone(fullPhone(values.country, values.phone)) ?? '')
      : '';
    const departure = departures.find((d) => d.value === values.departure)?.label ?? '';
    const page = window.location.pathname;
    const subject =
      kind === 'enquiry'
        ? `Inquiry: ${journey.title}`
        : `${kind === 'group' ? 'Group' : 'Private'} booking request: ${journey.title}`;
    const lines = (
      [
        ['Journey', journey.title],
        ['Type', copy.type ?? ''],
        ['Name', values.name.trim()],
        ['Email', values.email.trim()],
        ['Phone', phone],
        ['Guests', booking ? values.guests.trim() : ''],
        ['Departure', departure],
        ['Preferred dates', booking ? values.dates.trim() : ''],
        ['Room', booking ? values.room : ''],
        ['Note', values.notes[kind].trim()],
        ['Page', `${site.url}${page}`],
      ] as [string, string][]
    ).filter(([, value]) => value);

    setSent({ kind, subject, lines });
    setStatus('sending');
    try {
      const res = await postForm('/api/enquiry', {
        form: kind,
        slug: journey.slug,
        journey: journey.title,
        name: values.name.trim(),
        email: values.email.trim(),
        phone,
        notes: values.notes[kind].trim(),
        ...(booking
          ? {
              guests: Number(values.guests.trim()),
              room: values.room || undefined,
              departure: departure || undefined,
              dates: values.dates.trim(),
            }
          : {}),
        consent: values.consent,
        // The page the request came from, for the team's email.
        page,
        // Where this visitor first came from, stored with the request.
        source: readFirstTouch(),
        // The honeypot: a field no person sees or fills. The route drops
        // requests where it has a value.
        website: honeypot.current?.value ?? '',
      });
      if (!res.ok) {
        setServerError(await failureMessage(res));
        setStatus('error');
        return;
      }
      let delivered = false;
      try {
        const body: unknown = await res.json();
        delivered =
          !!body && typeof body === 'object' && 'delivered' in body && body.delivered === true;
      } catch {
        delivered = false;
      }
      track('enquiry_sent', { form: kind, journey: journey.title, delivered });
      setTried(false);
      if (delivered) {
        // Sent: the next request starts afresh, with the name, email and phone
        // kept, and the other forms' notes.
        setValues((v) => ({
          ...v,
          guests: '',
          departure: '',
          dates: '',
          room: '',
          notes: { ...v.notes, [kind]: '' },
          consent: false,
        }));
        setStatus('sent');
      } else {
        setStatus('undelivered');
      }
    } catch {
      setServerError('');
      setStatus('error');
    }
  }

  const mailto = sent
    ? `mailto:${site.email}?subject=${encodeURIComponent(sent.subject)}&body=${encodeURIComponent(
        sent.lines.map(([label, value]) => `${label}: ${value}`).join('\n'),
      )}`
    : `mailto:${site.email}`;

  const country = dialCodeOf(values.country);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={copy.title}
      describedBy={aboutId}
      initialFocus={coarse ? undefined : refs.name}
      returnFocus={returnFocus}
    >
      <div className="jf">
        {/* Read out as one sentence with the dialog's name; shown as a caps
            label, the journey's name and the type. */}
        <p id={aboutId} className="sr-only">
          {kind === 'enquiry'
            ? `Inquiring about ${journey.title}.`
            : `${journey.title}, as a ${kind} journey.`}
        </p>
        <p className="jf-about" aria-hidden>
          <span className="jf-about-k">{copy.about}</span>
          <span className="jf-about-t">{journey.title}</span>
          {copy.type && <span className="jf-tag">{copy.type}</span>}
        </p>

        {status === 'sent' ? (
          <div className="jf-done">
            <h3 ref={resultRef} tabIndex={-1} className="jf-done-h">
              Thank you. {FIRST_NAME} will be in touch within two days.
            </h3>
            <p>
              {kind === 'enquiry'
                ? `Your inquiry about ${journey.title} is with us.`
                : `Your request for ${journey.title} as a ${kind} journey is with us.`}{' '}
              If anything changes before then, write to{' '}
              <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
            <div className="jf-actions">
              <button type="button" className="jf-btn jf-btn-line" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : status === 'undelivered' ? (
          <div className="jf-done">
            <h3 ref={resultRef} tabIndex={-1} className="jf-done-h">
              One more step, please.
            </h3>
            <p>
              Your details were not sent to us automatically. Please email them to{' '}
              <a href={`mailto:${site.email}`}>{site.email}</a> — the button below opens a message
              with what you have written already filled in.
            </p>
            <div className="jf-actions">
              <a href={mailto} className="jf-btn jf-btn-blue">
                {copy.email}
              </a>
              <button type="button" className="jf-btn jf-btn-line" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="jf-intro">{copy.intro}</p>
            <form className="jf-form" noValidate aria-busy={sending} onSubmit={onSubmit}>
              <div className="jf-grid">
                <Field id={id('name')} label="Name" error={errors.name} className="jf-c3">
                  <input
                    ref={refs.name}
                    id={id('name')}
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={limits.name}
                    placeholder="Your name"
                    value={values.name}
                    onChange={(e) => set('name', e.target.value)}
                    {...invalid('name')}
                    className="jf-control"
                  />
                </Field>

                <Field id={id('email')} label="Email" error={errors.email} className="jf-c3">
                  <input
                    ref={refs.email}
                    id={id('email')}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    maxLength={limits.email}
                    placeholder="you@example.com"
                    value={values.email}
                    onChange={(e) => set('email', e.target.value)}
                    {...invalid('email')}
                    className="jf-control"
                  />
                </Field>

                <Field
                  id={id('phone')}
                  label="Phone"
                  optional={!booking}
                  error={errors.phone}
                  className={booking ? 'jf-c4' : 'jf-c3'}
                >
                  <span className="jf-phone" data-invalid={errors.phone ? '' : undefined}>
                    <span className="jf-code">
                      <span aria-hidden className="jf-code-iso">
                        {country[0]}
                      </span>
                      <span aria-hidden>+{country[2]}</span>
                      <Chevron />
                      <select
                        aria-label="Country calling code"
                        value={country[0]}
                        onChange={(e) => set('country', e.target.value)}
                      >
                        {dialCodes.map(([iso, name, code]) => (
                          <option key={iso} value={iso}>
                            {name} (+{code})
                          </option>
                        ))}
                      </select>
                    </span>
                    <input
                      ref={refs.phone}
                      id={id('phone')}
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      required={booking}
                      maxLength={limits.phoneNumber}
                      placeholder="Your number"
                      value={values.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      {...invalid('phone')}
                      className="jf-control"
                    />
                  </span>
                </Field>

                {booking && (
                  <Field id={id('guests')} label="Guests" error={errors.guests} className="jf-c2">
                    <input
                      ref={refs.guests}
                      id={id('guests')}
                      name="guests"
                      type="number"
                      inputMode="numeric"
                      min={1}
                      step={1}
                      required
                      value={values.guests}
                      onChange={(e) => set('guests', e.target.value)}
                      {...invalid('guests')}
                      className="jf-control"
                    />
                  </Field>
                )}

                {departures.length > 0 && (
                  <Field id={id('departure')} label="Departure" optional className="jf-c6">
                    <span className="jf-select">
                      <select
                        id={id('departure')}
                        name="departure"
                        value={values.departure}
                        onChange={(e) => set('departure', e.target.value)}
                        className="jf-control"
                      >
                        <option value="">Not sure yet</option>
                        {departures.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                      <Chevron className="jf-chev" />
                    </span>
                  </Field>
                )}

                {booking && (
                  <Field
                    id={id('dates')}
                    label={
                      kind === 'private'
                        ? 'Preferred dates'
                        : departures.length > 0
                          ? 'Or your preferred dates'
                          : 'Preferred month or dates'
                    }
                    optional
                    className="jf-c6"
                  >
                    <input
                      id={id('dates')}
                      name="dates"
                      autoComplete="off"
                      maxLength={limits.dates}
                      placeholder={
                        kind === 'private'
                          ? '10–22 September 2027, or flexible'
                          : 'June 2027, or flexible'
                      }
                      value={values.dates}
                      onChange={(e) => set('dates', e.target.value)}
                      className="jf-control"
                    />
                  </Field>
                )}

                {booking && (
                  <fieldset className="jf-field jf-c6" aria-describedby={`${id('room')}-hint`}>
                    <legend className="jf-label">
                      Room<span className="jf-opt"> (optional)</span>
                    </legend>
                    <div className="jf-chips">
                      {roomOptions.map((option) => (
                        <label key={option} className="jf-chip">
                          <input
                            type="radio"
                            name="room"
                            value={option}
                            checked={values.room === option}
                            onChange={() => set('room', option)}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                    <p id={`${id('room')}-hint`} className="jf-hint">
                      For more than one room, tell us the mix in your note.
                    </p>
                  </fieldset>
                )}

                <Field
                  id={id('notes')}
                  label={booking ? 'Anything we should know' : 'Your message'}
                  optional
                  className="jf-c6"
                >
                  <textarea
                    id={id('notes')}
                    name="notes"
                    rows={4}
                    maxLength={limits.notes}
                    placeholder={
                      booking
                        ? 'Dietary needs, a celebration, whether you’ve traveled with us before…'
                        : `What would you like to know about ${journey.title}?`
                    }
                    value={values.notes[kind]}
                    onChange={(e) => set('notes', { ...values.notes, [kind]: e.target.value })}
                    className="jf-control"
                  />
                </Field>
              </div>

              <div className="jf-field">
                <label className="jf-consent">
                  {/* Named by the sentence alone: the label around it also
                      holds the link's "(opens in a new tab)". */}
                  <input
                    ref={refs.consent}
                    type="checkbox"
                    name="consent"
                    required
                    aria-label={`${privacyConsent.before} ${privacyConsent.policy.label}`}
                    checked={values.consent}
                    onChange={(e) => set('consent', e.target.checked)}
                    {...invalid('consent')}
                  />
                  <span>
                    {privacyConsent.before}{' '}
                    <a
                      href={privacyConsent.policy.href}
                      target="_blank"
                      rel="noopener"
                      className="jf-link"
                    >
                      {privacyConsent.policy.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                      <NewTab />
                    </a>
                  </span>
                </label>
                {errors.consent && (
                  <FieldError id={`${id('consent')}-error`}>{errors.consent}</FieldError>
                )}
              </div>

              {/* Honeypot. `hidden` takes it off the page, out of the
                  accessibility tree and out of the Tab ring; bots reading the
                  markup still fill it, and autofill ignores the name. */}
              <div hidden aria-hidden>
                <label>
                  Leave this empty
                  <input
                    ref={honeypot}
                    name="website"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>

              {/* The two messages stand over the button, and stay in the page
                  while empty, so what they come to say is announced: the
                  checks' summary politely, a failed send at once. */}
              <div className="jf-end">
                <p className="jf-msg" aria-live="polite">
                  {summary}
                </p>
                <p className="jf-msg" role="alert">
                  {status === 'error'
                    ? serverError || `That didn’t send. Please try again, or email ${site.email}.`
                    : ''}
                </p>
                <div className="jf-foot">
                  <p className="jf-reply">We reply personally. No newsletters unless you ask.</p>
                  <button
                    type="submit"
                    className="jf-btn jf-btn-blue"
                    aria-disabled={sending || undefined}
                  >
                    {sending ? 'Sending…' : copy.send}
                  </button>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </Dialog>
  );
}

function Field({
  id,
  label,
  optional = false,
  error,
  className = '',
  children,
}: {
  id: string;
  label: string;
  /** Marks the field optional beside its label. */
  optional?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`jf-field ${className}`}>
      <label htmlFor={id} className="jf-label">
        {label}
        {optional && <span className="jf-opt"> (optional)</span>}
      </label>
      {children}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}

function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="jf-error">
      <svg
        aria-hidden
        focusable="false"
        width="14"
        height="14"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="8" cy="8" r="6.75" />
        <path d="M8 4.5v4.25M8 10.75v.75" strokeLinecap="round" />
      </svg>
      {children}
    </p>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      className={className ?? 'jf-chev'}
    >
      <path d="M1 1.5l5 5 5-5" />
    </svg>
  );
}

/** The small arrow that marks a link opening in a new tab. */
function NewTab() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
    >
      <path d="M3 1.5h5.5V7M8.5 1.5L1.5 8.5" />
    </svg>
  );
}
