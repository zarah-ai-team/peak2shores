export const site = {
  name: 'Peaks2Shores',
  tagline: 'Luxury travel, personally curated.',
  description:
    'Small-group luxury journeys of no more than 18 guests, personally curated by Marc Haeni. Fewer, better journeys to the places one person actually knows.',
  url: 'https://peaks2shores.com',
  founded: 2022,
  maxGuests: 18,
  email: 'hello@peaks2shores.com',
  /**
   * No real number has been supplied. The canvas carried "+1 (305) 000 0000"
   * as a placeholder; a placeholder must not ship — in the footer it is a
   * dead line, in structured data it is a policy risk. Set both fields when
   * the number exists and every phone link on the site appears.
   */
  phone: null as string | null,
  phoneHref: null as string | null,
  locations: 'Miami · Switzerland',
  legalName: 'Peaks2Shores LLC',
  founder: {
    name: 'Marc Haeni',
    role: 'Founder',
  },
} as const;

export type NavItem = { label: string; href: string };

/**
 * Routes whose first screen is a full-bleed photograph, so the header starts
 * transparent over it. Kept beside the navigation rather than in the header
 * so the two lists that have to agree — this and the pages that render
 * `data-hero` — sit in one place.
 */
export function isHeroRoute(pathname: string) {
  return (
    pathname === '/' ||
    pathname === '/our-story' ||
    pathname === '/destinations' ||
    /^\/journeys\/[^/]+$/.test(pathname)
  );
}

export const primaryNav: NavItem[] = [
  { label: 'Journeys', href: '/journeys' },
  { label: 'Destinations', href: '/destinations' },
  { label: 'Experiences', href: '/experiences' },
  { label: 'Our story', href: '/our-story' },
  { label: 'Journal', href: '/journal' },
];

export const ctaNav: NavItem = { label: 'Plan your journey', href: '/plan' };

export const footerNav: { label: string; items: NavItem[] }[] = [
  {
    label: 'Explore',
    items: [
      { label: 'Journeys', href: '/journeys' },
      { label: 'Destinations', href: '/destinations' },
      { label: 'Experiences', href: '/experiences' },
      { label: 'Journal', href: '/journal' },
    ],
  },
  {
    label: 'Company',
    items: [
      { label: 'Our story', href: '/our-story' },
      { label: 'Plan your journey', href: '/plan' },
      { label: 'Private & custom travel', href: '/plan#private' },
      { label: 'Contact', href: '/plan#contact' },
    ],
  },
];
