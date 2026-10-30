export const site = {
  name: 'Peaks2Shores',
  tagline: 'Luxury travel, personally curated.',
  description:
    'Small luxury group journeys of never more than 18 guests, personally curated by Marc Haeni. Iconic places, extraordinary experiences and lifelong connections.',
  url: 'https://peaks2shores.com',
  founded: 2022,
  maxGuests: 18,
  email: 'welcome@peaks2shores.com',
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
   * A scheduling link for "Book a call" (Calendly, Cal.com, Google
   * appointment page…). Unset until Marc chooses one; until then the button
   * falls back to the inquiry form on /plan.
   */
  bookingUrl: null as string | null,
  /**
   * Seller of Travel registration (California, Florida and others require it
   * to be displayed). Marc is confirming the number; when set, it appears in
   * the footer on every page.
   */
  sellerOfTravel: null as string | null,
  /** The Instagram profile, for structured data and the /links page. */
  instagram: 'https://www.instagram.com/peaks2shores/' as string | null,
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
  /** Switzerland is heritage, not an office (Marc, October 2026). */
  locations: 'Miami-based · Swiss-inspired',
  legalName: 'Peaks2Shores, Inc.',
  founder: {
    name: 'Marc Haeni',
    role: 'Founder',
  },
} as const;

/**
 * The WhatsApp link, or null while no number is set. It opens the chat with a
 * first message already naming Peaks2Shores, so both sides know who the
 * conversation is with. (What the visitor sees as the chat's name comes from
 * the WhatsApp Business profile on Marc's number — set it to "Peaks2Shores"
 * with the logo as its photo.)
 */
export function whatsappHref(): string | null {
  if (!site.whatsapp) return null;
  const text = `Hello ${site.name}, I’d like to talk about a journey.`;
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
}

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
    pathname === '/destinations' ||
    pathname === '/experiences' ||
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
      { label: 'Bespoke private travel', href: '/plan#private' },
      { label: 'Contact', href: '/plan#contact' },
    ],
  },
];

/**
 * Places and countries in running prose — "Bologna, Lake Garda and Venice" —
 * never as a list run together with dots.
 */
export const andList = new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' });
