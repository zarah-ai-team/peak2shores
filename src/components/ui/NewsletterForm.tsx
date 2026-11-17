'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { site } from '@/lib/site';
import { circleConsent, failureMessage, postForm } from '@/lib/forms';
import { track } from '@/lib/analytics';
import { readFirstTouch } from '@/lib/attribution';

type Status = 'idle' | 'sending' | 'done' | 'undelivered' | 'error';

export type NewsletterVariant = 'compact' | 'large' | 'dark' | 'invite';

/**
 * "Join the circle" — a rule, a field and a flush-left label.
 *
 * - `compact`: the small inline form (sans field).
 * - `large`: the homepage / journal form — the field is set in the serif at
 *   `.h5` size, with an ink submit.
 * - `dark`: for navy / navy-deep grounds (the footer) — on-dark rule,
 *   text and placeholder.
 * - `invite`: the homepage Circle over its photograph — a white pill of a
 *   field with a blue pill of a button beside it, the pair centred, stacking
 *   on a phone.
 *
 * Every form but the compact one carries the consent line: the privacy
 * policy, and that one can leave at any time. Its words live in lib/forms
 * (`circleConsent`); the form tells the route that it showed them, and on
 * which page, and the route sends that on with the address as the record of
 * consent.
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
  const invite = variant === 'invite';
  const dark = variant === 'dark' || invite;
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
      const res = await postForm('/api/subscribe', {
        email,
        website,
        source: readFirstTouch(),
        // For the list's record of consent: the page this form stands on, and
        // whether the consent line stood under the field.
        page: window.location.pathname,
        consent: variant !== 'compact',
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
    variant === 'compact' ? 'prose-body-sm' : dark ? 'h5 text-on-dark' : 'h5'
  }`;

  if (status === 'done') {
    return (
      <p ref={resultRef} tabIndex={-1} role="status" className={`${resultClass} ${className}`}>
        Welcome to The Circle. Please check your inbox to confirm your subscription.
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
        We couldn’t add you automatically just now. To join The Circle, email{' '}
        <a href={`mailto:${site.email}`} className="prose-link">
          {site.email}
        </a>{' '}
        and we’ll add you by hand.
      </p>
    );
  }

  // The band's field and the footer's are set at 1rem, not at the body size:
  // that is 16px on a phone or tablet, the size below which iOS Safari zooms
  // the whole page in when a field takes focus.
  // The band's field is a pill of dark glass the height of its button (no blur:
  // a translucent night ground with a white edge, so it sits in the photograph;
  // 37.8px with a mouse on a laptop, 44px
  // under a finger), its text 16px on every screen; the others are a
  // transparent line of text over the form's rule, which is their focus
  // indicator (`.field-rule`), so they drop the outline and it keeps one.
  const fieldText = invite
    ? 'prose-body min-h-(--pill-h) rounded-full border border-white/60 bg-[rgb(8_20_28/0.42)] px-5 text-[16px] leading-[1.25] text-white caret-white outline-2 outline-offset-2 outline-transparent placeholder:text-white/80 focus:bg-[rgb(8_20_28/0.55)] focus:outline-white'
    : variant === 'large'
      ? 'font-display text-[clamp(1.375rem,1.48vw,1.75rem)] font-normal leading-[1.2] py-3 placeholder:text-muted'
      : variant === 'dark'
        ? 'prose-body text-[1rem] py-3 text-on-dark placeholder:text-on-dark-muted'
        : 'prose-body-sm py-3 text-ink placeholder:text-muted';

  // The band's button is a blue pill beside the white field, the brand blue a
  // step deeper so its white label reads (4.9:1); white under the pointer.
  // While it sends it keeps its width and stays solid: faded over a
  // photograph, as the other forms fade on paper, "Sending" could not be read.
  const submit = invite
    ? 'min-h-(--pill-h) shrink-0 rounded-full bg-brand-deep px-(--pill-px) text-(length:--pill-fs) font-medium tracking-[0.16em] text-white transition-colors duration-300 hover:bg-white hover:text-ink focus-visible:outline-white aria-disabled:cursor-progress aria-disabled:bg-brand-deep aria-disabled:text-white sm:min-w-[160px]'
    : variant === 'large'
      ? 'btn ml-5 shrink-0 bg-ink px-[calc(var(--btn-px)-0.25rem)] py-[calc(var(--btn-py)-2px)] text-ivory hover:bg-brand-deep'
      : `shrink-0 py-3 pl-5 transition-colors duration-300 ${
          dark ? 'text-on-dark hover:text-acqua' : 'hover:text-brand'
        }`;

  return (
    <div
      className={`w-full ${variant === 'compact' ? '' : invite ? 'mx-auto max-w-[30rem]' : 'max-w-[32.5rem]'} ${className}`}
    >
      {/* `.field-rule` re-rules the line in water-blue while the field has
          focus; the invitation's field takes a white outline instead. */}
      <form
        onSubmit={onSubmit}
        className={
          invite
            ? 'relative flex flex-col gap-2 sm:flex-row'
            : `field-rule relative flex items-center border-b ${
                dark ? 'border-on-dark/40' : 'border-ink'
              } ${variant === 'large' ? 'pb-2' : ''}`
        }
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
          className={`min-w-0 ${invite ? 'sm:flex-1' : 'flex-1 border-0 bg-transparent outline-none'} ${fieldText}`}
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
          className={`font-ui uppercase leading-none ${
            invite
              ? ''
              : 'min-h-(--btn-h) text-(length:--type-button) font-medium tracking-[0.16em] aria-disabled:opacity-40'
          } ${submit}`}
        >
          {status === 'sending' ? 'Sending' : 'Join The Circle'}
        </button>
      </form>
      {variant !== 'compact' && (
        <p
          className={`prose-body-sm mt-3 ${invite ? 'text-center text-white' : dark ? 'text-on-dark-muted' : 'text-muted'}`}
        >
          {circleConsent.before}{' '}
          <a
            href={circleConsent.policy.href}
            className={`underline underline-offset-2 hover:no-underline${invite ? ' whitespace-nowrap' : ''}`}
          >
            {circleConsent.policy.label}
          </a>
          .{' '}
          {/* Centred over the photograph, the line breaks between its two
              sentences on a phone, never inside the link or the second one. */}
          {invite ? (
            <span className="whitespace-nowrap">{circleConsent.after}</span>
          ) : (
            circleConsent.after
          )}
        </p>
      )}
      <p
        id={`${id}-error`}
        role="alert"
        aria-live="assertive"
        className={`prose-body-sm mt-3 ${invite ? 'text-white' : dark ? 'text-error-dark' : 'text-error'}`}
      >
        {status === 'error'
          ? errorText || `That didn’t send. Please try again, or email ${site.email}.`
          : ''}
      </p>
    </div>
  );
}
