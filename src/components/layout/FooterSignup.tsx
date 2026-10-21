'use client';

import { usePathname } from 'next/navigation';
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
 * The footer's right-hand slot: the journal sign-up, or — on a route that
 * has just offered it — a quiet way on to planning instead.
 */
export function FooterSignup() {
  const pathname = usePathname() ?? '';

  if (hasOwnSignup(pathname)) {
    return (
      <ButtonLink href="/plan" variant="rule-dark" arrow>
        Plan your journey
      </ButtonLink>
    );
  }

  return (
    <>
      <p className="kicker mb-4">The travel journal</p>
      <NewsletterForm variant="dark" />
    </>
  );
}
