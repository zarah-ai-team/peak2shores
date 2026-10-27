import type { NavItem } from '../site';

/**
 * The footer's legal row. The primary, CTA and footer column links live in
 * `src/lib/site.ts` (primaryNav, ctaNav, footerNav), where the header and
 * menu already read them; this list is the copy of the one still hard-coded in
 * `components/layout/Footer.tsx`, so the provider can serve the whole
 * navigation. Keep the two in step until the Footer reads `getNavigation()`.
 */
export const legalNav: NavItem[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Terms & conditions', href: '/terms' },
  { label: 'Booking terms', href: '/booking-terms' },
  { label: 'Photography credits', href: '/credits' },
];
