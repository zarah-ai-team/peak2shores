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
 * Under the field every form carries the Privacy Policy tick box, unticked:
 * "I agree to the Privacy Policy" (the policy opens in a new tab, so a
 * half-filled form is not lost), and beside it "Unsubscribe at any time."
 * Nothing is sent until the box is ticked. A send without the tick says so
 * under the box, marks the box and moves focus to it; from then on the
 * message follows the box, and ticking it clears both. The words live in
 * lib/forms (`circleConsent`). /api/subscribe refuses a sign-up without the
 * tick, and sends the sentence the visitor ticked on with the address, and
 * the page the form stood on, as the record of consent.
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
  const [consented, setConsented] = useState(false);
  /** True once a send was tried without the tick: the box's message then follows it. */
  const [tried, setTried] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorText, setErrorText] = useState('');
  const resultRef = useRef<HTMLParagraphElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const id = `email-${useId().replace(/:/g, '')}`;
  /** A send found the box unticked, and it still is. */
  const unticked = tried && !consented;
  /** The last send went to the route and failed. */
  const failed = status === 'error' && !unticked;

  useEffect(() => {
    if (status === 'done' || status === 'undelivered') resultRef.current?.focus();
  }, [status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    if (!consented) {
      // Nothing is sent without the tick. The message under the box takes the
      // place of an earlier failed send's, and the reader is taken to the box.
      setTried(true);
      setStatus('idle');
      setErrorText('');
      consentRef.current?.focus();
      return;
    }
    setStatus('sending');
    try {
      const res = await postForm('/api/subscribe', {
        email,
        website,
        source: readFirstTouch(),
        // For the list's record of consent: the page this form stands on, and
        // that the visitor ticked the box.
        page: window.location.pathname,
        consent: consented,
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

  // The tick box's line on each ground, a quiet line in the small print's
  // place. Over the photograph: white words, centred, and a white-edged box of
  // the field's dark glass that fills white once ticked, with a white focus
  // ring. On the footer's navy: its muted on-dark words, the box edged in the
  // same, water-blue once ticked. On paper: the muted ink, the box edged in it,
  // navy once ticked, as the journey pop-ups' box is. Off the photograph a
  // send without the tick also edges the box in the error colour until it is
  // ticked; over it the white message under the box says so alone. Under
  // forced colours (Windows high contrast) the fills give way to the system's,
  // so the tick takes the system's text colour to stay seen.
  const consentTone = invite
    ? {
        line: 'justify-center text-center text-white',
        box: 'border-white bg-[rgb(8_20_28/0.42)] checked:bg-white focus-visible:outline-white',
        tick: 'text-navy',
      }
    : dark
      ? {
          line: 'text-on-dark-muted',
          box: 'border-on-dark-muted checked:border-acqua checked:bg-acqua aria-[invalid=true]:border-error-dark',
          tick: 'text-navy-deep',
        }
      : {
          line: 'text-muted',
          box: 'border-muted checked:border-navy checked:bg-navy aria-[invalid=true]:border-error',
          tick: 'text-white',
        };

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
          aria-describedby={failed ? `${id}-error` : undefined}
          aria-invalid={failed ? true : undefined}
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
      {/* The tick box, then "Unsubscribe at any time." beside it as plain
          words. On a narrow screen the line breaks between the two, never
          inside the label. It stands outside the <form> so the field's row
          keeps its own layout; the form's send reads its state. */}
      <p
        className={`prose-body-sm mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 ${consentTone.line}`}
      >
        {/* The box and its words are one target: 24px tall with a mouse,
            44px under a finger. */}
        <label className="inline-flex min-h-[24px] cursor-pointer items-center gap-3 pointer-coarse:min-h-11">
          <span className="relative inline-flex shrink-0">
            {/* Named by the sentence alone: the label around it also holds
                the link's "(opens in a new tab)". Marked valid outright until
                a send finds it unticked: a browser would otherwise announce
                the required box as invalid before anything has been sent. */}
            <input
              ref={consentRef}
              type="checkbox"
              name="consent"
              required
              aria-label={`${circleConsent.before} ${circleConsent.policy.label}`}
              aria-invalid={unticked}
              aria-describedby={unticked ? `${id}-error` : undefined}
              checked={consented}
              onChange={(e) => setConsented(e.target.checked)}
              className={`peer m-0 block size-5 cursor-pointer appearance-none border-[1.5px] transition-colors duration-200 ${consentTone.box}`}
            />
            <svg
              aria-hidden
              focusable="false"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`pointer-events-none absolute inset-0 hidden size-full peer-checked:block forced-colors:text-[color:CanvasText] ${consentTone.tick}`}
            >
              <path d="M5.5 10.5l3 3 6-7" />
            </svg>
          </span>
          <span>
            {circleConsent.before}{' '}
            <a
              href={circleConsent.policy.href}
              target="_blank"
              rel="noopener"
              className="inline-flex items-baseline gap-1 whitespace-nowrap underline underline-offset-2 hover:no-underline"
            >
              {circleConsent.policy.label}
              <span className="sr-only"> (opens in a new tab)</span>
              <NewTab />
            </a>
          </span>
        </label>
        <span>{circleConsent.after}</span>
      </p>
      {/* The form's one message, under the box: the tick box's, or a failed
          send's. It stays in the page so that what it comes to say is
          announced; the box, or the field, is described by it while it
          speaks of them. Over the photograph it takes the band's soft dark
          glow, as the line above it does, so it holds 4.5:1 where the
          photograph is bright. */}
      <p
        id={`${id}-error`}
        role="alert"
        aria-live="assertive"
        className={`prose-body-sm mt-3 ${
          invite
            ? 'text-white [text-shadow:0_0_1.25rem_rgb(0_0_0/0.45),0_1px_0.25rem_rgb(0_0_0/0.35)]'
            : dark
              ? 'text-error-dark'
              : 'text-error'
        }`}
      >
        {unticked
          ? circleConsent.unticked
          : failed
            ? errorText || `That didn’t send. Please try again, or email ${site.email}.`
            : ''}
      </p>
    </div>
  );
}

/** The small arrow that marks a link opening in a new tab, as the journey pop-ups draw it. */
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
      className="shrink-0"
    >
      <path d="M3 1.5h5.5V7M8.5 1.5L1.5 8.5" />
    </svg>
  );
}
