'use client';

import { useEffect } from 'react';
import { SectionLabel } from '@/components/ui/Editorial';
import { enterAt } from '@/lib/motion';
import { site } from '@/lib/site';

/**
 * The technical detail goes to the console and the error reporter — never to
 * the visitor, who gets a sentence in the brand's own voice.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[peaks2shores]', error);
  }, [error]);

  return (
    <section className="gutter editorial-grid min-h-[70svh] items-center pb-24 pt-32 md:pt-40">
      <SectionLabel className="enter lg:pt-4" style={enterAt(0)}>
        Something went wrong
      </SectionLabel>
      <h1 className="h1 enter" style={enterAt(0.1)}>
        We’ve lost the thread of this page.
      </h1>
      <div className="enter max-w-[440px] lg:pt-4" style={enterAt(0.24)}>
        <p className="prose-body mb-8">
          Nothing you did caused it. Try again, and if it keeps happening, write to us — we answer
          personally.
        </p>
        <div className="flex flex-wrap items-center gap-7">
          <button
            type="button"
            onClick={reset}
            className="btn bg-ink px-[26px] py-4 font-ui text-[11px] font-medium uppercase leading-none tracking-[0.16em] text-ivory hover:bg-body"
          >
            Try again
          </button>
          <a href={`mailto:${site.email}`} className="link-rule">
            {site.email}
          </a>
        </div>
      </div>
    </section>
  );
}
