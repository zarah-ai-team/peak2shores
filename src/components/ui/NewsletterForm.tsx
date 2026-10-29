'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { site } from '@/lib/site';
import { failureMessage } from '@/lib/forms';
import { track } from '@/lib/analytics';
import { readFirstTouch } from '@/lib/attribution';

type Status = 'idle' | 'sending' | 'done' | 'undelivered' | 'error';

export type NewsletterVariant = 'compact' | 'large' | 'dark';

/**
 * "Join the circle" — a rule, a field and a flush-left label.
 *
 * - `compact`: the small inline form (sans field).
 * - `large`: the homepage / journal form — the field is set in the serif at
 *   `.h5` size, with an ink submit.
 * - `dark`: for navy / navy-deep grounds (the footer) — on-dark rule,
 *   text and placeholder.
 *
 * Posts to /api/subscribe, which answers `{ ok, delivered }`. `delivered:
 * false` means no mailing provider is wired yet and nothing was stored, so the
 * form says so honestly and offers the email address instead of claiming a
 * sign-up. A hidden `website` field is the honeypot the route checks.
 *
 * The status line is a persistent live region; on a result, focus moves to it,
 * since the button that had focus is gone.
 */
export function NewsletterForm({
  variant: variantProp,
  compact = false,
  className = '',
}: {
  variant?: NewsletterVariant;
  /** Legacy alias for `variant="compact"`. */
  compact?: boolean;
  className?: string;
}) {
  const variant: NewsletterVariant = variantProp ?? (compact ? 'compact' : 'large');
  const dark = variant === 'dark';
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorText, setErrorText] = useState('');
  const resultRef = useRef<HTMLParagraphElement>(null);
  const id = `email-${useId().replace(/:/g, '')}`;

  useEffect(() => {
    if (status === 'done' || status === 'undelivered') resultRef.current?.focus();
  }, [status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, source: readFirstTouch() }),
      });
      if (res.ok) {
        const data = (await res.json().catch(() => ({}))) as { delivered?: boolean };
        if (data.delivered === false) {
          setStatus('undelivered');
        } else {
          setStatus('done');
          track('newsletter_signup');
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

  const resultClass = `outline-none ${
    variant === 'compact' ? 'prose-body-sm' : variant === 'dark' ? 'h5 text-on-dark' : 'h5'
  }`;

  if (status === 'done') {
    return (
      <p ref={resultRef} tabIndex={-1} role="status" className={`${resultClass} ${className}`}>
        You’re on the list. Marc’s next letter will find you.
      </p>
    );
  }

  if (status === 'undelivered') {
    return (
      <p
        ref={resultRef}
        tabIndex={-1}
        role="status"
        className={`outline-none ${variant === 'compact' ? 'prose-body-sm' : 'prose-body'} ${
          dark ? 'text-on-dark-body' : ''
        } ${className}`}
      >
        We couldn’t add you automatically just now. To join the circle, email{' '}
        <a href={`mailto:${site.email}`} className="prose-link">
          {site.email}
        </a>{' '}
        and we’ll add you by hand.
      </p>
    );
  }

  const fieldText =
    variant === 'large'
      ? 'font-display text-[clamp(1.375rem,1.48vw,1.75rem)] font-normal leading-[1.2] py-3 placeholder:text-muted'
      : variant === 'dark'
        ? 'prose-body py-3 text-on-dark placeholder:text-on-dark-muted'
        : 'prose-body-sm py-3 text-ink placeholder:text-muted';

  const submit =
    variant === 'large'
      ? 'btn ml-5 shrink-0 bg-ink px-[calc(var(--btn-px)-0.25rem)] py-[calc(var(--btn-py)-2px)] text-ivory hover:bg-brand'
      : `shrink-0 py-3 pl-5 transition-colors duration-300 ${
          dark ? 'text-on-dark hover:text-acqua' : 'hover:text-brand'
        }`;

  return (
    <div className={`w-full ${variant === 'compact' ? '' : 'max-w-[32.5rem]'} ${className}`}>
      {/* `.field-rule` re-rules the line in water-blue while the field has focus. */}
      <form
        onSubmit={onSubmit}

        className={`field-rule relative flex items-center border-b ${
          dark ? 'border-on-dark/40' : 'border-ink'
        } ${variant === 'large' ? 'pb-2' : ''}`}
      >
        <label htmlFor={id} className="sr-only">
          Your email address
        </label>
        <input
          id={id}
          type="email"
          required
          maxLength={254}
          pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}"
          title="An address like name@example.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email"
          aria-describedby={status === 'error' ? `${id}-error` : undefined}
          aria-invalid={status === 'error' ? true : undefined}
          className={`min-w-0 flex-1 border-0 bg-transparent outline-none ${fieldText}`}
        />
        {/* Honeypot: hidden from people, screen readers and page captures;
            bots reading the markup still fill it. */}
        <div hidden aria-hidden>
          <label htmlFor={`${id}-website`}>Website</label>
          <input
            id={`${id}-website`}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>
        <button
          type="submit"
          aria-disabled={status === 'sending'}
          className={`min-h-(--btn-h) font-ui text-(length:--type-button) font-medium uppercase leading-none tracking-[0.16em] aria-disabled:opacity-40 ${submit}`}
        >
          {status === 'sending' ? 'Sending' : 'Join the circle'}
        </button>
      </form>
      <p
        id={`${id}-error`}
        role="alert"
        aria-live="assertive"
        className={`prose-body-sm mt-3 ${dark ? 'text-error-dark' : 'text-error'}`}
      >
        {status === 'error'
          ? errorText || `That didn’t send. Please try again, or email ${site.email}.`
          : ''}
      </p>
    </div>
  );
}
