'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Reveal } from '@/components/motion/Reveal';
import { Button, ButtonLink } from '@/components/ui/Button';
import { SectionLabel, Tick } from '@/components/ui/Editorial';
import { site } from '@/lib/site';
import { failureMessage } from '@/lib/forms';
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
  /** Extra content under the intro, e.g. contact lines. */
  children?: ReactNode;
};

const inputClass =
  'prose-body w-full border-0 bg-transparent p-0 !text-ink outline-none placeholder:text-stone-text';

/**
 * "Tell us a little. We'll call you, not the other way round."
 *
 * On stone (so the page never runs dark into the dark footer): the headline
 * in the first five columns, the form in the last
 * six. Fields are rules, not boxes: a caps label, an underline, and type at
 * reading size. The rule above a field turns blue while it has focus.
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
  children,
}: EnquiryFormProps) {
  const [party, setParty] = useState<string>('Couple');
  const [status, setStatus] = useState<Status>('idle');
  const [errorText, setErrorText] = useState('');
  const [submitted, setSubmitted] = useState<Submitted>({});
  const doneRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === 'sent' || status === 'undelivered') doneRef.current?.focus();
  }, [status]);

  const firstName = site.founder.name.split(' ')[0];
  const defaultIntro =
    journeyTitle && departure && typeof spotsLeft === 'number'
      ? `${journeyTitle} departs ${departure} with ${spotsLeft} of ${groupMax} places remaining. Inquiring holds nothing and commits you to nothing — it starts a conversation with ${firstName}.`
      : `Tell us where you’d like to go and who you’re traveling with. Inquiring holds nothing and commits you to nothing — it starts a conversation with ${firstName}.`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;

    const data = new FormData(event.currentTarget);
    const field = (name: string) => {
      const value = data.get(name);
      return typeof value === 'string' ? value.trim() : '';
    };
    const journey = journeyTitle ?? (field('journey') || undefined);
    setStatus('sending');

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          phone: data.get('phone'),
          guests: data.get('guests'),
          travelWindow: data.get('travelWindow'),
          heardFrom: data.get('heardFrom'),
          notes: data.get('notes'),
          party,
          journey,
          // Where this visitor first came from — stored with the enquiry.
          source: readFirstTouch(),
          // Honeypot: a field no person sees or fills. The server drops
          // submissions where it has a value.
          website: data.get('website'),
        }),
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
    <section id="enquire" aria-label={headline} className="bg-stone py-section-sm text-ink">
      <div data-tone="stone" className="container-site grid-site gap-y-block">
        <Reveal className="col-span-4 flex flex-col gap-stack md:col-span-8 lg:col-span-5">
          <SectionLabel tone="stone" className="flex items-center gap-3.5">
            <Tick />
            {kicker}
          </SectionLabel>
          <h2 className="h2">{headline}</h2>
          <p className="prose-body measure-lead">{intro ?? defaultIntro}</p>
          <div id="contact" className="meta flex flex-col gap-1 text-body">
            <a href={`mailto:${site.email}`} className="prose-link self-start">
              {site.email}
            </a>
            {site.phone && site.phoneHref && (
              <a href={`tel:${site.phoneHref}`} className="prose-link self-start">
                {site.phone}
              </a>
            )}
          </div>
          {children}
        </Reveal>

        <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
          {status === 'sent' ? (
            <div role="status" className="border-t border-line py-12">
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
            <div role="status" className="border-t border-line py-12">
              <h3 ref={doneRef} tabIndex={-1} className="h3 mb-stack outline-none">
                One more step, please.
              </h3>
              <p className="prose-body measure mb-stack">
                Your details were not sent to us automatically. Please email them to {site.email} —
                the button below opens a message with what you have written already filled in.
              </p>
              <ButtonLink href={mailto} variant="navy" arrow>
                Email your inquiry
              </ButtonLink>
            </div>
          ) : (
            <Reveal delay={0.1}>
              <form onSubmit={onSubmit} className="flex flex-col">
                <div className="grid gap-x-10 sm:grid-cols-2">
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

                  <Field label="Phone (optional)">
                    <input
                      name="phone"
                      type="tel"
                      maxLength={40}
                      autoComplete="tel"
                      placeholder="+1 305 000 0000"
                      className={inputClass}
                    />
                  </Field>

                  <fieldset className="m-0 flex flex-col gap-2.5 border-0 border-t border-line p-0 py-[22px]">
                    <legend className="kicker-sm float-left mb-2.5 p-0">Traveling as</legend>
                    <div className="clear-left flex flex-wrap gap-x-[18px]">
                      {PARTY_OPTIONS.map((option) => {
                        const on = party === option;
                        return (
                          <button
                            key={option}
                            type="button"
                            aria-pressed={on}
                            onClick={() => setParty(option)}
                            className={`toggle-link prose-body-sm min-h-11 border-0 bg-transparent px-0 py-2 transition-colors hover:!text-ink ${
                              on ? '!text-ink' : '!text-stone-text'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

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

                  {!journeyTitle && journeyOptions && (
                    <Field label="Journey of interest" className="sm:col-span-2">
                      <span className="relative block">
                        <select
                          name="journey"
                          defaultValue=""
                          className={`${inputClass} appearance-none pr-8`}
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
                          strokeWidth="1"
                          className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-stone-text"
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

                  <Field label="Anything we should know" className="border-b sm:col-span-2">
                    <textarea
                      name="notes"
                      rows={3}
                      maxLength={2000}
                      placeholder="Dates, dietary notes, whether you’ve traveled with us before…"
                      className={`${inputClass} resize-y`}
                    />
                  </Field>

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

                <div className="flex flex-wrap items-center justify-between gap-6 pt-7">
                  <span className="prose-body-sm max-w-[34ch] !text-stone-text">
                    We reply personally. No newsletters unless you ask.
                  </span>
                  <Button type="submit" variant="navy" arrow aria-disabled={status === 'sending'}>
                    {status === 'sending' ? 'Sending' : 'Send inquiry'}
                  </Button>
                </div>

                <p role="alert" aria-live="assertive" className="prose-body-sm mt-5 !text-error">
                  {status === 'error'
                    ? errorText || `That didn’t send. Please try again, or email ${site.email}.`
                    : ''}
                </p>
              </form>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`field-rule field-rule--top group flex flex-col gap-2.5 border-t border-line py-[22px] ${className}`}
    >
      <span className="kicker-sm transition-colors duration-300 group-focus-within:!text-ink">
        {label}
      </span>
      {children}
    </label>
  );
}
