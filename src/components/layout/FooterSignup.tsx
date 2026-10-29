'use client';

import { usePathname } from 'next/navigation';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { NewsletterForm } from '@/components/ui/NewsletterForm';

/**
 * Routes that already carry the journal sign-up in their own body (the
 * homepage's Circle, the journal page). The footer must not ask twice.
 */
function hasOwnSignup(pathname: string) {
  return pathname === '/' || pathname === '/journal' || pathname.startsWith('/journal/');
}

/**
 * The footer's opening band: the journal sign-up with its line, or — on a
 * route that has just offered it — the brand line and a quiet way on to
 * planning instead.
 */
export function FooterSignup() {
  const pathname = usePathname() ?? '';
  const own = hasOwnSignup(pathname);

  return (
    <>
      <Reveal variant="mask" className="col-span-full lg:col-span-7">
        <p className="h2 m-0">
          {own
            ? 'Iconic places. Extraordinary experiences. Lifelong connections.'
            : 'A world of inspiration, delivered.'}
        </p>
        {!own && (
          <p className="prose-body measure mt-stack text-on-dark-body">
            Discover extraordinary destinations, travel stories, insider perspectives, and
            inspiration for your next journey.
          </p>
        )}
      </Reveal>
      <Reveal
        delay={0.1}
        className="col-span-full md:col-span-6 lg:col-span-5 lg:col-start-8 lg:self-end"
      >
        {own ? (
          <ButtonLink href="/plan" variant="rule-dark" arrow>
            Plan your journey
          </ButtonLink>
        ) : (
          <>
            <p className="kicker mb-4">The travel journal</p>
            <NewsletterForm variant="dark" />
          </>
        )}
      </Reveal>
    </>
  );
}
