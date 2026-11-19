'use client';

import { useSelectedLayoutSegment } from 'next/navigation';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { NewsletterForm } from '@/components/ui/NewsletterForm';

/**
 * Whether the page already carries the journal sign-up in its own body (the
 * homepage's Circle, the journal page). The footer must not ask twice.
 *
 * Read from the route the root layout is showing, not from the address: no
 * segment on the homepage, `journal` on the journal and any page under it. A
 * missing page is its own route (`/_not-found`), so it keeps the sign-up
 * whatever its address. The address can differ between the server and the
 * browser: Vercel renders the hourly rebuild of the homepage under "/index",
 * so usePathname() read "/index" on the server and "/" in the browser. The
 * cached homepage carried the sign-up, the browser swapped it for the brand
 * line, and React threw error #418 (found 19 Nov 2026). The route is the same
 * on both sides.
 */
function hasOwnSignup(segment: string | null) {
  return segment === null || segment === 'journal';
}

/**
 * The footer's opening band: the journal sign-up with its line, or — on a
 * route that has just offered it — the brand line and a quiet way on to
 * planning instead.
 */
export function FooterSignup() {
  const own = hasOwnSignup(useSelectedLayoutSegment());

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
          <ButtonLink href="/plan" variant="outline-dark" arrow>
            Plan Your Journey
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
