'use client';

import { useEffect, useRef, useState } from 'react';
import { Ground } from '@/components/motion/Ground';
import { Reveal } from '@/components/motion/Reveal';
import { Button } from '@/components/ui/Button';
import { SectionLabel, Tick } from '@/components/ui/Editorial';
import { site } from '@/lib/site';

const PARTY_OPTIONS = ['Couple', 'Friends', 'Family', 'Solo'] as const;

type Status = 'idle' | 'sending' | 'sent' | 'error';

export type EnquiryFormProps = {
  /** The journey being enquired about, if any. */
  journeyTitle?: string;
  /** e.g. "12 September 2027". */
  departure?: string;
  spotsLeft?: number;
  groupMax?: number;
  headline?: string;
  intro?: string;
};

/**
 * "Tell us a little. We'll call you, not the other way round."
 *
 * Fields are rules, not boxes: a caps label, an underline, and type at reading
 * size. Nothing is placed on a filled input. The rule above a field turns
 * acqua while it has focus.
 *
 * The status line is a persistent live region so success and failure are
 * announced; on success focus moves to the confirmation heading.
 */
export function EnquiryForm({
  journeyTitle,
  departure,
  spotsLeft,
  groupMax = site.maxGuests,
  headline = 'Tell us a little. We’ll call you, not the other way round.',
  intro,
}: EnquiryFormProps) {
  const [party, setParty] = useState<string>('Couple');
  const [status, setStatus] = useState<Status>('idle');
  const sentRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === 'sent') sentRef.current?.focus();
  }, [status]);

  const firstName = site.founder.name.split(' ')[0];
  const defaultIntro =
    journeyTitle && departure && typeof spotsLeft === 'number'
      ? `${journeyTitle} departs ${departure} with ${spotsLeft} of ${groupMax} places remaining. Enquiring holds nothing and commits you to nothing — it starts a conversation with ${firstName}.`
      : `Tell us where you’d like to go and who you’re travelling with. Enquiring holds nothing and commits you to nothing — it starts a conversation with ${firstName}.`;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;

    const data = new FormData(event.currentTarget);
    setStatus('sending');

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          guests: data.get('guests'),
          notes: data.get('notes'),
          party,
          journey: journeyTitle,
          // Honeypot: a field no person sees or fills. The server drops
          // submissions where it has a value.
          website: data.get('website'),
        }),
      });
      setStatus(res.ok ? 'sent' : 'error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <Ground
      id="enquire"
      className="gutter grid gap-14 bg-ink py-24 text-on-dark md:py-[140px] lg:grid-cols-2 lg:gap-24"
    >
      <Reveal className="flex flex-col gap-7">
        <SectionLabel tone="dark" className="flex items-center gap-3.5">
          <Tick className="bg-acqua" />
          Plan your journey
        </SectionLabel>
        <h2 className="h2">{headline}</h2>
        <p className="prose-body max-w-[440px] text-on-dark-body">{intro ?? defaultIntro}</p>
        <div
          id="contact"
          className="font-ui text-[14px] font-light leading-[1.8] text-on-dark-body"
        >
          <a href={`mailto:${site.email}`} className="hover:text-acqua">
            {site.email}
          </a>
          {site.phone && (
            <>
              <br />
              <a href={`tel:${site.phoneHref}`} className="hover:text-acqua">
                {site.phone}
              </a>
            </>
          )}
        </div>
      </Reveal>

      {status === 'sent' ? (
        <div role="status" className="border-t border-line-dark py-12">
          <h3 ref={sentRef} tabIndex={-1} className="h4 mb-4 outline-none">
            Thank you. Marc will be in touch within two days.
          </h3>
          <p className="prose-body text-[15px] text-on-dark-body">
            In the meantime, the journal has a note on the coast in September.
          </p>
        </div>
      ) : (
        <Reveal delay={0.12}>
          <form onSubmit={onSubmit} className="flex flex-col">
            <div className="grid gap-x-10 sm:grid-cols-2">
              <Field label="Name">
                <input
                  name="name"
                  required
                  maxLength={200}
                  autoComplete="name"
                  placeholder="Your name"
                  className="w-full border-0 bg-transparent p-0 font-ui text-[16px] font-light leading-[1.3] text-on-dark outline-none placeholder:text-on-dark-muted"
                />
              </Field>

              <Field label="Email">
                <input
                  name="email"
                  type="email"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full border-0 bg-transparent p-0 font-ui text-[16px] font-light leading-[1.3] text-on-dark outline-none placeholder:text-on-dark-muted"
                />
              </Field>

              <fieldset className="m-0 flex flex-col gap-2.5 border-0 border-t border-line-dark p-0 py-[22px]">
                <legend className="kicker-sm p-0 text-on-dark-muted">Travelling as</legend>
                <div className="flex flex-wrap gap-[18px]">
                  {PARTY_OPTIONS.map((option) => {
                    const on = party === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setParty(option)}
                        className="toggle-link min-h-6 border-0 bg-transparent py-1.5 font-ui text-[15px] font-light hover:text-acqua"
                        style={{
                          color: on ? 'var(--color-on-dark)' : 'var(--color-on-dark-muted)',
                        }}
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
                  className="w-full border-0 bg-transparent p-0 font-ui text-[16px] font-light leading-[1.3] text-on-dark outline-none placeholder:text-on-dark-muted"
                />
              </Field>

              <Field label="Anything we should know" className="border-b sm:col-span-2">
                <textarea
                  name="notes"
                  rows={3}
                  maxLength={2000}
                  placeholder="Dates, dietary notes, whether you’ve travelled with us before…"
                  className="w-full resize-y border-0 bg-transparent p-0 font-ui text-[16px] font-light leading-[1.5] text-on-dark outline-none placeholder:text-on-dark-muted"
                />
              </Field>

              {/* Honeypot. Out of the accessibility tree and off screen; real
                  browsers never fill it, and autofill ignores the name. */}
              <div aria-hidden className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
                <label>
                  Leave this empty
                  <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-6 pt-7">
              <span className="max-w-[300px] font-ui text-[12px] font-light leading-[1.5] text-on-dark-muted">
                We reply personally. No newsletters unless you ask.
              </span>
              <Button type="submit" variant="light" aria-disabled={status === 'sending'}>
                {status === 'sending' ? 'Sending' : 'Send enquiry'}
              </Button>
            </div>

            <p role="alert" aria-live="assertive" className="prose-body-sm mt-5 text-acqua">
              {status === 'error'
                ? `That didn’t send. Please try again, or email ${site.email}.`
                : ''}
            </p>
          </form>
        </Reveal>
      )}
    </Ground>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      className={`field-rule field-rule--top group flex flex-col gap-2.5 border-t border-line-dark py-[22px] ${className}`}
      style={{ borderColor: 'var(--color-line-dark)' }}
    >
      <span className="kicker-sm text-on-dark-muted transition-colors duration-300 group-focus-within:text-acqua">
        {label}
      </span>
      {children}
    </label>
  );
}
