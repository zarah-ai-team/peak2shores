'use client';

import { useEffect } from 'react';
import { Button, ButtonLink } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/Editorial';
import { enterAt } from '@/lib/motion';
import { site } from '@/lib/site';

/**
 * The technical detail goes to the console and the error reporter — never to
 * the visitor, who gets a sentence in the brand's own voice. Charcoal ground;
 * no preloader interplay (the entrance uses the same CSS `.enter` as any page).
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
    <section
      data-tone="dark"
      className="flex min-h-[78svh] items-center bg-charcoal pb-section-sm pt-[calc(var(--nav-h)+64px)] text-on-dark"
    >
      <div className="container-site">
        <div className="grid-site gap-y-10">
          <div className="col-span-full lg:col-span-8">
            <SectionLabel as="p" tone="dark" className="enter m-0 mb-8" style={enterAt(0)}>
              Something went wrong
            </SectionLabel>
            <h1 className="page-title enter m-0 max-w-[20ch]" style={enterAt(0.1)}>
              We’ve lost the thread of this page.
            </h1>
          </div>
          <div
            className="enter col-span-full md:col-span-6 lg:col-span-4 lg:col-start-9 lg:self-end"
            style={enterAt(0.24)}
          >
            <p className="prose-body mb-8">
              Nothing you did caused it. Try again, and if it keeps happening, write to us — we
              answer personally.
            </p>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
              <Button type="button" variant="light" onClick={reset}>
                Try again
              </Button>
              <ButtonLink href="/" variant="rule-dark">
                Home
              </ButtonLink>
            </div>
            <p className="prose-body-sm mt-8">
              <a href={`mailto:${site.email}`} className="prose-link">
                {site.email}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
