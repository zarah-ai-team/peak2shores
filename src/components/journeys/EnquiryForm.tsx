'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { Button, ButtonLink } from '@/components/ui/Button';
import { SectionLabel, Tick } from '@/components/ui/Editorial';
import { site } from '@/lib/site';
import { failureMessage, postForm, privacyConsent } from '@/lib/forms';
import { track } from '@/lib/analytics';
import { readFirstTouch } from '@/lib/attribution';

const PARTY_OPTIONS = ['Couple', 'Friends', 'Family', 'Solo'] as const;

/**
 * idle → sending → one of:
 *   sent       the API accepted it AND forwarded it (`delivered: true`)
 *   undelivered the API accepted it but no delivery is configured
 *              (`delivered: false`) — nothing reached anyone, so we say so
 *              and hand the reader a prefilled email instead
 *   error      refused (422/429) or the provider failed (502)
 */
type Status = 'idle' | 'sending' | 'sent' | 'undelivered' | 'error';

type Submitted = Record<string, string>;

export type EnquiryFormProps = {
  /** The journey being inquired about, if any. */
  journeyTitle?: string;
  /** e.g. "12 – 20 September 2027". */
  departure?: string;
  spotsLeft?: number;
  groupMax?: number;
  /** The caps label above the headline. */
  kicker?: string;
  headline?: string;
  intro?: string;
  /**
   * For the general form (no journeyTitle): the journeys a visitor can pick
   * from. A private journey is always offered as well.
   */
  journeyOptions?: string[];
  /**
   * Journey addresses to their titles, so "Request details" on a journey page
   * (/plan?journey=swiss-elegance#contact) arrives with that journey chosen.
   */
  journeySlugs?: Record<string, string>;
  /** Extra content under the intro, e.g. contact lines. */
  children?: ReactNode;
};

/* A field: a white box with a hairline edge that turns brand blue, with a
   soft blue halo, while it has focus — the halo is its focus indicator. */
const control =
  'block w-full rounded-[0.25rem] border border-[rgb(20_29_36/0.16)] bg-white px-3.5 font-ui text-[0.9375rem] text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-muted hover:border-[rgb(20_29_36/0.32)] focus:border-brand focus:shadow-[0_0_0_0.1875rem_rgb(17_144_203/0.18)]';
const inputClass = `${control} h-12`;

/* A field's name: the site's caps label, a step larger and darker than a
   kicker, so it reads at a glance in a form. */
const labelClass = 'font-ui text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-body';

/* The Privacy Policy tick box, as on a journey page's pop-ups. The box is
   named by the sentence alone, since the label around it also holds the
   link's "(opens in a new tab)". The error is the one /api/enquiry gives. */
const consentName = `${privacyConsent.before} ${privacyConsent.policy.label}`;
const consentError = privacyConsent.unticked;

/**
 * "Tell us a little. We'll call you, not the other way round."
 *
 * On the soft blue ground (so the page never runs dark into the dark footer):
 * the headline, the line and the ways to talk in the first five columns; the
 * form in the last six, as a white card. On a journey's page the card opens
 * on the journey and its dates, so it is clear what is being asked about.
 * Fields are boxes with a caps label above; "traveling as" is a row of
 * choices; the Privacy Policy tick box is the last field, and the note and
 * the button close the card.
 *
 * The browser checks the name and the email. The tick box starts clear and
 * nothing sends until it is ticked: a send that finds it clear puts an error
 * line under it, and focus moves to the box unless the browser has a name or
 * an email to point to first. The line is read out politely, so it waits for
 * what the browser says about those fields. It goes as soon as the box is
 * ticked.
 *
 * The status line is a persistent live region so failures are announced; on
 * success focus moves to the confirmation heading. The confirmation never
 * claims more than the server confirmed: when the API reports the inquiry was
 * not delivered anywhere, the reader is told so and offered an email with
 * their details already written.
 */
export function EnquiryForm({
  journeyTitle,
  departure,
  spotsLeft,
  groupMax = site.maxGuests,
  kicker = 'Plan your journey',
  headline = 'Tell us a little. We’ll call you, not the other way round.',
  intro,
  journeyOptions,
  journeySlugs,
  children,
}: EnquiryFormProps) {
  const journeySelect = useRef<HTMLSelectElement>(null);
  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('journey');
    const title = slug ? journeySlugs?.[slug] : undefined;
    if (title && journeySelect.current) journeySelect.current.value = title;
  }, [journeySlugs]);
  const [party, setParty] = useState<string>('Couple');
  const [status, setStatus] = useState<Status>('idle');
  const [errorText, setErrorText] = useState('');
  const [submitted, setSubmitted] = useState<Submitted>({});
  const doneRef = useRef<HTMLHeadingElement>(null);
  const [consent, setConsent] = useState(false);
  /** True once a send has found the box clear: from then on its error follows the box. */
  const [consentTried, setConsentTried] = useState(false);
  const consentRef = useRef<HTMLInputElement>(null);
  const consentErrorId = `${useId()}-consent-error`;
  const consentMissing = consentTried && !consent;

  useEffect(() => {
    if (status === 'sent' || status === 'undelivered') doneRef.current?.focus();
  }, [status]);

  /* The box is `required`, so the browser's check before a send finds it
     clear. Its own error line answers instead of the browser's bubble, and the
     form's state follows the box, which a browser can change behind React's
     back. The browser moves focus to a name or an email it found wrong; when
     the box is the only field wrong, focus moves to the box. */
  function onConsentInvalid(event: React.FormEvent<HTMLInputElement>) {
    event.preventDefault();
    setConsent(false);
    setConsentTried(true);
    const box = event.currentTarget;
    if (box.form?.querySelector('input:invalid, select:invalid, textarea:invalid') === box) {
      box.focus();
    }
  }

  const firstName = site.founder.name.split(' ')[0];
  const defaultIntro =
    journeyTitle && departure && typeof spotsLeft === 'number'
      ? `${journeyTitle} departs ${departure} with ${spotsLeft} ${spotsLeft === 1 ? 'place' : 'places'} remaining. Inquiring holds nothing and commits you to nothing — it starts a conversation with ${firstName}.`
      : `Tell us where you’d like to go and who you’re traveling with. Inquiring holds nothing and commits you to nothing — it starts a conversation with ${firstName}.`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    // Nothing sends without the tick, even where the browser skipped its check.
    // The box as it shows decides, and the form's state follows it.
    const ticked = consentRef.current?.checked ?? consent;
    if (ticked !== consent) setConsent(ticked);
    if (!ticked) {
      setConsentTried(true);
      consentRef.current?.focus();
      return;
    }

    const data = new FormData(event.currentTarget);
    const field = (name: string) => {
      const value = data.get(name);
      return typeof value === 'string' ? value.trim() : '';
    };
    const journey = journeyTitle ?? (field('journey') || undefined);
    setStatus('sending');

    try {
      const res = await postForm('/api/enquiry', {
        name: data.get('name'),
        email: data.get('email'),
        phone: data.get('phone'),
        guests: data.get('guests'),
        travelWindow: data.get('travelWindow'),
        heardFrom: data.get('heardFrom'),
        notes: data.get('notes'),
        party,
        journey,
        // The Privacy Policy box, ticked: the route refuses a request without it.
        consent: ticked,
        // Where this visitor first came from — stored with the enquiry.
        source: readFirstTouch(),
        // Honeypot: a field no person sees or fills. The server drops
        // submissions where it has a value.
        website: data.get('website'),
      });
      if (res.ok) {
        let delivered = false;
        try {
          const body: unknown = await res.json();
          delivered =
            !!body && typeof body === 'object' && 'delivered' in body && body.delivered === true;
        } catch {
          delivered = false;
        }
        track('enquiry_sent', { journey: journey ?? 'private', delivered });
        if (delivered) {
          setStatus('sent');
        } else {
          setSubmitted({
            Name: field('name'),
            Email: field('email'),
            Phone: field('phone'),
            Journey: journey ?? 'A private journey, or not sure yet',
            'Traveling as': party,
            Guests: field('guests'),
            When: field('travelWindow'),
            'Heard about us': field('heardFrom'),
            Notes: field('notes'),
          });
          setStatus('undelivered');
        }
      } else {
        setErrorText(await failureMessage(res));
        setStatus('error');
      }
    } catch {
      setErrorText('');
      setStatus('error');
    }
  }

  const mailto = (() => {
    const subject = `Enquiry: ${submitted.Journey ?? 'a journey'}`;
    const body = Object.entries(submitted)
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join('\n');
    return `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  })();

  return (
    <section
      id="enquire"
      aria-label={headline}
      className="relative bg-stone py-section-sm text-ink"
    >
      {/* `#contact`, where the site's Contact and "Book a call" links land:
          an empty mark where the content begins, so from 1024px the top of
          the form, with the words beside it. Not the "Prefer to talk?" lines
          there: they stay pinned beside the form, so a jump to them would
          land wherever they were pinned, past the top of the form. The mark
          is kept out of the slide-in that blocks get as they scroll into view
          (`data-no-settle`): a jump from far up the page then lands on where
          the content rests, not where its slide-in still holds it.
          On a touch screen below 1024px, where the words come first and
          nothing slides in, CSS anchor positioning moves the mark onto the
          "Prefer to talk?" lines, so the ways to talk and the start of the
          form share the screen, on a phone held sideways too. A browser
          without anchor positioning keeps the mark where the content
          begins. */}
      <div
        id="contact"
        data-no-settle
        className="max-lg:pointer-coarse:absolute max-lg:pointer-coarse:inset-x-0 max-lg:pointer-coarse:top-[anchor(--prefer-to-talk_top)]"
      />
      {/* `data-fab-clear`: the floating "Connect with our team" steps aside
          while the form and the ways to talk pass under it, rather than sit
          over their fields and links. */}
      <div data-tone="stone" className="container-site grid-site gap-y-block" data-fab-clear>
        {/* On a desktop the words stay beside the card while the form is filled
            in, clear of the header and a journey's pinned tab bar. */}
        <Reveal className="col-span-4 flex flex-col gap-stack md:col-span-8 lg:sticky lg:top-[calc(var(--nav-h-compact)+6rem)] lg:col-span-5 lg:self-start">
          <SectionLabel tone="stone" className="flex items-center gap-3.5">
            <Tick />
            {kicker}
          </SectionLabel>
          <h2 className="h2">{headline}</h2>
          <p className="prose-body measure-lead">{intro ?? defaultIntro}</p>
          <div className="mt-2 flex flex-col gap-3 border-t border-[rgb(20_29_36/0.14)] pt-6 [anchor-name:--prefer-to-talk]">
            <span className="kicker-sm">Prefer to talk?</span>
            <a
              href={`mailto:${site.email}`}
              className="inline-flex items-center gap-3 self-start font-ui text-[0.9375rem] text-ink transition-colors hover:text-brand-deep"
            >
              <ContactIcon kind="email" />
              {site.email}
            </a>
            {site.phone && site.phoneHref && (
              <a
                href={`tel:${site.phoneHref}`}
                className="inline-flex items-center gap-3 self-start font-ui text-[0.9375rem] text-ink transition-colors hover:text-brand-deep"
              >
                <ContactIcon kind="phone" />
                {site.phone}
              </a>
            )}
          </div>
          {children}
        </Reveal>

        <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
          <div
            data-tone="light"
            className="rounded-lg border border-[rgb(20_29_36/0.08)] bg-white p-6 shadow-[0_1.875rem_3.75rem_-2.25rem_rgb(10_34_50/0.45)] md:p-8 lg:p-10"
          >
            {status === 'sent' ? (
              <div role="status">
                <h3 ref={doneRef} tabIndex={-1} className="h3 mb-stack outline-none">
                  Thank you. Marc will be in touch within two days.
                </h3>
                <p className="prose-body measure">
                  If anything changes before then, write to{' '}
                  <a href={`mailto:${site.email}`} className="prose-link">
                    {site.email}
                  </a>
                  .
                </p>
              </div>
            ) : status === 'undelivered' ? (
              <div role="status">
                <h3 ref={doneRef} tabIndex={-1} className="h3 mb-stack outline-none">
                  One more step, please.
                </h3>
                <p className="prose-body measure mb-stack">
                  Your details were not sent to us automatically. Please email them to {site.email}{' '}
                  — the button below opens a message with what you have written already filled in.
                </p>
                <ButtonLink href={mailto} variant="navy" arrow className="rounded-[0.25rem]">
                  Email your inquiry
                </ButtonLink>
              </div>
            ) : (
              <Reveal delay={0.1}>
                {/* The page's script sends the form. Pressed before it has
                    run, or without it, the browser sends the form itself:
                    `method="post"` keeps what was typed out of the address
                    (a GET would put it there, in the history and in the
                    host's logs), and it comes back to this form. Nothing is
                    delivered that way, so without a script the form says so
                    first. */}
                <form onSubmit={onSubmit} method="post" action="#contact" className="flex flex-col">
                  <noscript>
                    <p className="prose-body-sm mb-7">
                      This form needs JavaScript to send. Please email{' '}
                      <a href={`mailto:${site.email}`} className="prose-link">
                        {site.email}
                      </a>{' '}
                      instead.
                    </p>
                  </noscript>
                  {journeyTitle && (
                    <p className="mb-7 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-[rgb(20_29_36/0.08)] pb-5">
                      <span className="kicker-sm">Inquiring about</span>
                      <span className="font-display text-[1.25rem] leading-tight text-ink">
                        {journeyTitle}
                      </span>
                      {departure && <span className="meta text-muted">{departure}</span>}
                    </p>
                  )}

                  <div className="grid gap-x-5 gap-y-5 sm:grid-cols-2">
                    <Field label="Name">
                      <input
                        name="name"
                        required
                        maxLength={200}
                        autoComplete="name"
                        placeholder="Your name"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Email">
                      <input
                        name="email"
                        type="email"
                        required
                        maxLength={254}
                        pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}"
                        title="An address like name@example.com"
                        autoComplete="email"
                        placeholder="you@example.com"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Phone" optional>
                      <input
                        name="phone"
                        type="tel"
                        maxLength={40}
                        autoComplete="tel"
                        placeholder="+1 305 000 0000"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Guests">
                      <input
                        name="guests"
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={groupMax}
                        placeholder="2"
                        className={inputClass}
                      />
                    </Field>

                    <fieldset className="m-0 min-w-0 border-0 p-0 sm:col-span-2">
                      <legend className={`${labelClass} mb-2 p-0`}>Traveling as</legend>
                      <div className="flex flex-wrap gap-2">
                        {PARTY_OPTIONS.map((option) => {
                          const on = party === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              aria-pressed={on}
                              onClick={() => setParty(option)}
                              className={`h-11 rounded-[0.25rem] border px-5 font-ui text-[0.875rem] transition-colors duration-200 ${
                                on
                                  ? 'border-navy bg-navy text-white'
                                  : 'border-[rgb(20_29_36/0.16)] bg-white text-body hover:border-brand-deep hover:text-brand-deep'
                              }`}
                            >
                              {option}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>

                    {!journeyTitle && journeyOptions && (
                      <Field label="Journey of interest" className="sm:col-span-2">
                        <span className="relative block">
                          <select
                            name="journey"
                            ref={journeySelect}
                            defaultValue=""
                            className={`${inputClass} appearance-none pr-10`}
                          >
                            <option value="" className="text-ink">
                              A private journey, or not sure yet
                            </option>
                            {journeyOptions.map((title) => (
                              <option key={title} value={title} className="text-ink">
                                {title}
                              </option>
                            ))}
                          </select>
                          <svg
                            aria-hidden
                            width="12"
                            height="8"
                            viewBox="0 0 12 8"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.2"
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                          >
                            <path d="M1 1.5l5 5 5-5" />
                          </svg>
                        </span>
                      </Field>
                    )}

                    <Field label="When would you like to travel">
                      <input
                        name="travelWindow"
                        maxLength={120}
                        placeholder="September 2027, or flexible"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="How did you hear about us">
                      <input
                        name="heardFrom"
                        maxLength={120}
                        placeholder="Instagram, a friend, Google…"
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Anything we should know" className="sm:col-span-2">
                      <textarea
                        name="notes"
                        rows={4}
                        maxLength={2000}
                        placeholder="Dates, dietary notes, whether you’ve traveled with us before…"
                        className={`${control} min-h-[7rem] resize-y py-3`}
                      />
                    </Field>

                    {/* The Privacy Policy tick box: a quiet line, 44px tall to
                        a finger, only as wide as the box and its words, so a
                        press on the empty space beside them ticks nothing. The
                        box starts clear on every visit, as in the pop-ups:
                        `autoComplete="off"` keeps a browser that reloads the
                        page on Back from bringing back a tick the form's state
                        cannot see. Under a finger the link is a 44px target of
                        its own, centred on its words, so a press just above or
                        below them opens the policy rather than ticking the
                        box. Its error line stays in the page while empty, so
                        what it comes to say is read out, politely, after what
                        the browser says about a name or an email. */}
                    <div className="flex min-w-0 flex-col sm:col-span-2">
                      <label className="flex min-h-11 cursor-pointer items-center gap-3 self-start font-ui text-[0.875rem] leading-[1.5] text-body pointer-coarse:min-h-[44px]">
                        <input
                          ref={consentRef}
                          type="checkbox"
                          name="consent"
                          required
                          autoComplete="off"
                          aria-label={consentName}
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                          onInvalid={onConsentInvalid}
                          aria-invalid={consentMissing}
                          aria-describedby={consentMissing ? consentErrorId : undefined}
                          className={`m-0 size-5 shrink-0 cursor-pointer accent-navy ${
                            consentMissing
                              ? 'outline-2 outline-offset-2 outline-error focus-visible:outline-ink'
                              : ''
                          }`}
                        />
                        <span>
                          {privacyConsent.before}{' '}
                          <a
                            href={privacyConsent.policy.href}
                            target="_blank"
                            rel="noopener"
                            className="relative inline-flex items-baseline gap-1 text-ink underline decoration-acqua-deep decoration-1 underline-offset-[0.22em] transition-colors duration-300 hover:text-acqua-text hover:decoration-current pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:top-1/2 pointer-coarse:after:h-11 pointer-coarse:after:-translate-y-1/2"
                          >
                            {privacyConsent.policy.label}
                            <span className="sr-only"> (opens in a new tab)</span>
                            <NewTab />
                          </a>
                        </span>
                      </label>
                      <p
                        id={consentErrorId}
                        aria-live="polite"
                        className="m-0 flex items-start gap-[0.4375rem] font-ui text-[0.8125rem] leading-[1.45] text-error [&:not(:empty)]:mt-2"
                      >
                        {consentMissing && (
                          <>
                            <svg
                              aria-hidden
                              focusable="false"
                              width="14"
                              height="14"
                              viewBox="0 0 16 16"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="mt-0.5 shrink-0"
                            >
                              <circle cx="8" cy="8" r="6.75" />
                              <path d="M8 4.5v4.25M8 10.75v.75" strokeLinecap="round" />
                            </svg>
                            {consentError}
                          </>
                        )}
                      </p>
                    </div>

                    {/* Honeypot. `hidden` takes it off the page, out of the
                        accessibility tree and out of page captures; bots reading
                        the markup still fill it, and autofill ignores the name. */}
                    <div hidden aria-hidden>
                      <label>
                        Leave this empty
                        <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-4 border-t border-[rgb(20_29_36/0.08)] pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <span className="prose-body-sm max-w-[34ch] !text-muted">
                      We reply personally. No newsletters unless you ask.
                    </span>
                    <Button
                      type="submit"
                      variant="navy"
                      arrow
                      aria-disabled={status === 'sending'}
                      className="!justify-center rounded-[0.25rem] sm:min-w-[12.5rem]"
                    >
                      {status === 'sending' ? 'Sending' : 'Send inquiry'}
                    </Button>
                  </div>

                  <p role="alert" aria-live="assertive" className="prose-body-sm mt-4 !text-error">
                    {status === 'error'
                      ? errorText || `That didn’t send. Please try again, or email ${site.email}.`
                      : ''}
                  </p>
                </form>
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  optional = false,
  children,
  className = '',
}: {
  label: string;
  /** Marks the field optional beside its label. */
  optional?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <span className={labelClass}>
        {label}
        {optional && (
          <span className="font-normal normal-case tracking-normal text-muted"> (optional)</span>
        )}
      </span>
      {children}
    </label>
  );
}

/** The small arrow that marks a link opening in a new tab, as on the pop-ups. */
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

function ContactIcon({ kind }: { kind: 'email' | 'phone' }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-[rgb(20_29_36/0.16)] bg-white text-brand"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {kind === 'email' ? (
          <path d="M3 6h18v12H3zM3 7l9 6 9-6" />
        ) : (
          <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
        )}
      </svg>
    </span>
  );
}
