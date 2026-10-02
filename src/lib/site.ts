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
   * Confirmed by Marc, October 2026. (The old site's "Call" button dialled
   * 250-5050 by mistake.) Shown as a one-tap link in the footer and in the
   * Organization structured data.
   */
  phone: '+1 786 253 5050' as string | null,
  phoneHref: '+17862535050' as string | null,
  /**
   * WhatsApp, as the international number with digits only (e.g.
   * '17862535050'). Unset until Marc confirms which number takes WhatsApp;
   * when set, a one-tap WhatsApp link appears beside the phone number.
   */
  whatsapp: null as string | null,
  /**
   * Seller of Travel registration (California, Florida and others require it
   * to be displayed). Marc is confirming the number; when set, it appears in
   * the footer on every page.
   */
  sellerOfTravel: null as string | null,
  /** The Instagram profile, for structured data and the /links page. */
  instagram: null as string | null,
  /**
   * Whether AI companies may use the site to train their models (GPTBot,
   * ClaudeBot, Google-Extended, Applebot-Extended, CCBot). Marc's decision.
   * AI *search* tools that quote and link to the site are always allowed; this
   * switch only governs training. Currently allowed, as before.
   */
  allowAiTraining: true,
  /**
   * The legal pages exist with their full structure but await Marc's final
   * wording. While true they carry a draft notice and are kept out of search.
   */
  legalDraft: true,
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
