/**
 * The content models the UI is written against.
 *
 * These are the shapes a CMS adapter has to produce. They are deliberately
 * plain data — strings, numbers, arrays, media keys — so anything here can be
 * passed from a server component to a client component without surprises.
 * (Functions, Dates and class instances are not used for that reason; dates
 * are ISO 8601 strings.)
 */
import type { MediaKey, MediaSlot } from '../media';
import type {
  Hotel,
  Inspiration,
  ItineraryDay,
  Journey,
  JourneyDetail,
  JourneyStatus,
  JourneySummary,
  Party,
  Season,
} from '../journeys';
import type {
  Experience,
  JournalEntry,
  Pillar,
  circle,
  founder,
  journalCategories,
  peaksToShores,
  philosophy,
  reasons,
  services,
  signatureHotels,
  speak,
} from '../data/copy';
import type { NavItem, site } from '../site';

/* -- Journeys ------------------------------------------------------------ */

export type {
  Hotel,
  Inspiration,
  ItineraryDay,
  Journey,
  JourneyDetail,
  JourneyStatus,
  JourneySummary,
  Party,
  Season,
};

/* -- Destinations -------------------------------------------------------- */

/**
 * A country we return to, described only by the journeys that go there.
 * Derived from the catalog — nothing is invented. A CMS may later supply
 * destinations as their own documents; the shape stays the same.
 */
export type Destination = {
  /** URL-safe key, e.g. 'south-africa'. No /destinations/[slug] route exists yet. */
  slug: string;
  country: string;
  regions: string[];
  /** Summaries only — itineraries never cross to the browser. */
  journeys: JourneySummary[];
  media: MediaKey;
};

/* -- Experiences --------------------------------------------------------- */

export type { Experience };

/* -- Journal ------------------------------------------------------------- */

export type JournalCategory = (typeof journalCategories)[number];

/**
 * A journal entry. `draft: true` until the piece is written; drafts are never
 * given an address, never appear in the sitemap or llms.txt, and are only
 * returned by the provider as teasers (`getForthcomingArticles`).
 */
export type JournalArticle = JournalEntry & {
  /** Release time, ISO 8601 with offset. Same rule as journeys. */
  publishAt?: string;
  /** The written piece, as paragraphs. Absent until it is written. */
  body?: string[];
};

/** What a journal index shows for a piece still in preparation: no body. */
export type ForthcomingArticle = Omit<JournalArticle, 'body'>;

/* -- Site settings & navigation ----------------------------------------- */

export type SiteSettings = typeof site;

export type { NavItem };

export type Navigation = {
  primary: NavItem[];
  cta: NavItem;
  footer: { label: string; items: NavItem[] }[];
  legal: NavItem[];
};

/* -- Page copy ----------------------------------------------------------- */

export type { Pillar };

export type HomeContent = {
  philosophy: typeof philosophy;
  pillars: Pillar[];
  reasons: typeof reasons;
  peaksToShores: typeof peaksToShores;
  signatureHotels: typeof signatureHotels;
  founder: typeof founder;
  circle: typeof circle;
  services: typeof services;
  speak: typeof speak;
};

export type OurStoryContent = { founder: typeof founder; pillars: Pillar[] };
export type DestinationsContent = { peaksToShores: typeof peaksToShores };
export type ExperiencesContent = { experiences: Experience[] };
export type JournalContent = { categories: readonly JournalCategory[]; circle: typeof circle };

export type PageContentMap = {
  home: HomeContent;
  'our-story': OurStoryContent;
  destinations: DestinationsContent;
  experiences: ExperiencesContent;
  journal: JournalContent;
};

export type PageKey = keyof PageContentMap;

/** Every editable copy block, as one document. What a source returns. */
export type PageCopy = {
  philosophy: typeof philosophy;
  pillars: Pillar[];
  reasons: typeof reasons;
  peaksToShores: typeof peaksToShores;
  signatureHotels: typeof signatureHotels;
  founder: typeof founder;
  circle: typeof circle;
  services: typeof services;
  speak: typeof speak;
  journalCategories: readonly JournalCategory[];
};

/* -- Media --------------------------------------------------------------- */

export type { MediaKey, MediaSlot };

/* -- SEO ----------------------------------------------------------------- */

/** The inputs to `pageMetadata()` — what a CMS "SEO" field group maps onto. */
export type SeoFields = {
  title: string;
  description: string;
  /** Path from the site root, e.g. '/journeys/amalfi-slowly'. */
  path: string;
  type?: 'website' | 'article';
  /** Keep the page out of search (drafts, utility pages). */
  noindex?: boolean;
};

/* -- Query options ------------------------------------------------------- */

export type ContentQueryOptions = {
  /**
   * Include scheduled journeys and draft articles. Internal use only — a
   * preview route or a build script. Never pass this from a public page.
   */
  includeDrafts?: boolean;
  /** The moment to evaluate `publishAt` against. Defaults to now. */
  now?: Date;
};
