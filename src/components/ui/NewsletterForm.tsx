'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '@/lib/site';
import { failureMessage } from '@/lib/forms';
import { track } from '@/lib/analytics';
import { readFirstTouch } from '@/lib/attribution';

type Status = 'idle' | 'sending' | 'done' | 'error';

/**
 * "Join the circle" — a rule, a field and a flush-left label.
 *
 * Posts to /api/subscribe, which records the address server-side. That route
 * is the single place to wire the mailing provider before launch.
 *
 * The status line is a persistent live region so the outcome is announced;
 * on success focus moves to it, since the button that had focus is gone.
 */
export function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorText, setErrorText] = useState('');
  const doneRef = useRef<HTMLParagraphElement>(null);
  const id = compact ? 'email-footer' : 'email-circle';

  useEffect(() => {
    if (status === 'done') doneRef.current?.focus();
  }, [status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: readFirstTouch() }),
      });
      if (res.ok) {
        setStatus('done');
        track('newsletter_signup');
      } else {
        setErrorText(await failureMessage(res));
        setStatus('error');
      }
    } catch {
      setErrorText('');
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <p
        ref={doneRef}
        tabIndex={-1}
        role="status"
        className={`outline-none ${compact ? 'prose-body-sm' : 'font-display text-[24px] leading-[1.3]'}`}
      >
        You’re on the list. Marc’s next letter will find you.
      </p>
    );
  }

  return (
    <div className={compact ? '' : 'w-full max-w-[480px]'}>
      {/* `.field-rule` re-rules the line in acqua while the field has focus. */}
      <form
        onSubmit={onSubmit}
        className="field-rule flex max-w-[480px] items-center border-b border-ink"
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
          className={`min-w-0 flex-1 border-0 bg-transparent font-ui font-light text-ink outline-none placeholder:text-muted ${
            compact ? 'py-3 text-[14px]' : 'py-4 text-[15px]'
          }`}
        />
        <button
          type="submit"
          aria-disabled={status === 'sending'}
          className="shrink-0 py-3 pl-5 font-ui text-[11px] font-medium uppercase leading-none tracking-[0.16em] transition-colors duration-300 hover:text-acqua-text aria-disabled:opacity-45"
        >
          {status === 'sending' ? 'Sending' : 'Join the circle'}
        </button>
      </form>
      <p
        id={`${id}-error`}
        role="alert"
        aria-live="assertive"
        className="prose-body-sm mt-3 text-acqua-text"
      >
        {status === 'error'
          ? errorText || `That didn’t send. Please try again, or email ${site.email}.`
          : ''}
      </p>
    </div>
  );
}
