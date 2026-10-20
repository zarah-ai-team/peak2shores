/**
 * The content provider — the only place pages should read content from.
 *
 *   import { getJourneySummaries, getPageContent } from '@/lib/content';
 *
 * SERVER-ONLY BY CONVENTION. Call these from server components,
 * `generateMetadata`, `generateStaticParams`, route handlers and sitemap/robots
 * — never from a 'use client' file. (The `server-only` package is not
 * installed, so this is not enforced by the build.) Pass what a client
 * component needs to it as props, and prefer `JourneySummary` over `Journey`
 * so itineraries never reach the browser.
 *
 * Every getter is async, so swapping the local TypeScript source for a CMS
 * (see ./source.ts) changes no call site. Every getter applies the publishing
 * rules by default: scheduled journeys (publishAt in the future) and draft
 * articles are invisible. `{ includeDrafts: true }` is for internal preview
 * tooling only.
 *
 * Pages that list scheduled content must keep `export const revalidate = 3600`
 * so a journey appears within the hour of its release time.
 *
 * ---------------------------------------------------------------------------
 * LEGACY EXPORTS. This module replaced `src/lib/content.ts`; the raw copy now
 * lives in `src/lib/data/copy.ts` and is re-exported at the bottom so existing
 * `import { pillars } from '@/lib/content'` lines keep compiling. New code
 * should use the async getters instead.
 */
import { getMedia } from '../media';
import { isLive, isNew, journeyLabel, rankRelated, toSummary } from '../journeys';
import { pageMetadata, jsonLd } from '../seo';
import { source } from './source';
import type {
  ContentQueryOptions,
  Destination,
  Experience,
  ForthcomingArticle,
  JournalArticle,
  JournalCategory,
  Journey,
  JourneySummary,
  Navigation,
  PageContentMap,
  PageKey,
  SiteSettings,
} from './types';

export type * from './types';
export type { ContentSource } from './source';

/* -- Publishing rules ---------------------------------------------------- */

/** True when a dated item has been released (or was never scheduled). */
function released(item: { publishAt?: string }, now: Date) {
  return !item.publishAt || new Date(item.publishAt) <= now;
}

/**
 * Guest quotes appear only when verified (a real guest, with permission).
 * Unverified ones are removed before a journey leaves the provider, so no page
 * can render them by accident. None is verified today.
 */
function withVerifiedQuotes(journey: Journey): Journey {
  if (!journey.detail) return journey;
  const quotes = journey.detail.quotes.filter((q) => q.verified === true);
  return quotes.length === journey.detail.quotes.length
    ? journey
    : { ...journey, detail: { ...journey.detail, quotes } };
}

function visibleJourneys(all: readonly Journey[], opts: ContentQueryOptions = {}) {
  const now = opts.now ?? new Date();
  const visible = opts.includeDrafts ? [...all] : all.filter((j) => isLive(j, now));
  return opts.includeDrafts ? visible : visible.map(withVerifiedQuotes);
}

/** Written, and released. Drafts are never published, whatever their date. */
function isPublishedArticle(article: JournalArticle, now: Date) {
  return !article.draft && released(article, now);
}

/** URL-safe key for a country: 'South Africa' → 'south-africa'. */
function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/* -- Journeys ------------------------------------------------------------ */

/** Every visible journey, in catalogue order. Full objects — server use only. */
export async function getJourneys(opts?: ContentQueryOptions): Promise<Journey[]> {
  return visibleJourneys(await source.journeys(), opts);
}

/** A visible journey by slug, or null (call `notFound()` on null). */
export async function getJourneyBySlug(
  slug: string,
  opts?: ContentQueryOptions,
): Promise<Journey | null> {
  return (await getJourneys(opts)).find((j) => j.slug === slug) ?? null;
}

/** Slugs for `generateStaticParams`. Published journeys only. */
export async function getJourneySlugs(): Promise<string[]> {
  return (await getJourneys()).map((j) => j.slug);
}

/** Index-card data for every visible journey. Safe to pass to client components. */
export async function getJourneySummaries(opts?: ContentQueryOptions): Promise<JourneySummary[]> {
  return (await getJourneys(opts)).map(toSummary);
}

/** The journeys flagged `featured`, as summaries (homepage). */
export async function getFeaturedJourneys(opts?: ContentQueryOptions): Promise<JourneySummary[]> {
  return (await getJourneys(opts)).filter((j) => j.featured).map(toSummary);
}

/**
 * Up to `limit` other visible journeys, most alike first: a shared country
 * counts most, then shared inspirations, then the same season. Ties keep
 * catalogue order. Departed journeys are left out.
 */
export async function getRelatedJourneys(
  slug: string,
  limit = 3,
  opts?: ContentQueryOptions,
): Promise<JourneySummary[]> {
  return rankRelated(await getJourneys(opts), slug, limit).map(toSummary);
}

/**
 * Journey titles the enquiry form may name — every visible journey, so a
 * sold-out one can still take a waitlist enquiry. `/api/enquiry` validates the
 * submitted title against this same list.
 */
export async function getEnquirableJourneyTitles(): Promise<string[]> {
  return (await getJourneys()).map((j) => j.title);
}

/* -- Destinations -------------------------------------------------------- */

/**
 * One destination per country that a visible journey goes to, in the order
 * the catalogue first reaches it. A two-country journey ('Italy &
 * Switzerland') counts under both.
 */
export async function getDestinations(opts?: ContentQueryOptions): Promise<Destination[]> {
  const byCountry = new Map<string, Journey[]>();
  for (const journey of await getJourneys(opts)) {
    for (const country of journey.country.split(' & ')) {
      const list = byCountry.get(country) ?? [];
      list.push(journey);
      byCountry.set(country, list);
    }
  }
  return [...byCountry.entries()].map(([country, list]) => ({
    slug: slugify(country),
    country,
    regions: [...new Set(list.map((j) => j.region))],
    journeys: list.map(toSummary),
    media: list[0].listMedia,
  }));
}

export async function getDestinationBySlug(
  slug: string,
  opts?: ContentQueryOptions,
): Promise<Destination | null> {
  return (await getDestinations(opts)).find((d) => d.slug === slug) ?? null;
}

/* -- Experiences --------------------------------------------------------- */

export async function getExperiences(): Promise<Experience[]> {
  return [...(await source.experiences())];
}

export async function getExperienceBySlug(slug: string): Promise<Experience | null> {
  return (await source.experiences()).find((e) => e.slug === slug) ?? null;
}

/* -- Journal ------------------------------------------------------------- */

/** Written, released articles. Empty today — every entry is still a draft. */
export async function getPublishedArticles(opts?: ContentQueryOptions): Promise<JournalArticle[]> {
  const now = opts?.now ?? new Date();
  const all = await source.journal();
  return opts?.includeDrafts ? [...all] : all.filter((a) => isPublishedArticle(a, now));
}

/** A published article by slug, or null. Drafts have no address. */
export async function getArticleBySlug(
  slug: string,
  opts?: ContentQueryOptions,
): Promise<JournalArticle | null> {
  return (await getPublishedArticles(opts)).find((a) => a.slug === slug) ?? null;
}

/**
 * Pieces in preparation, as teasers with no body, for the journal index's
 * "in preparation" cards. These must render without a link to a detail page
 * and must never be listed in the sitemap, llms.txt or JSON-LD.
 */
export async function getForthcomingArticles(): Promise<ForthcomingArticle[]> {
  const now = new Date();
  return (await source.journal())
    .filter((a) => !isPublishedArticle(a, now))
    .map((article) => {
      const teaser: ForthcomingArticle & { body?: string[] } = { ...article };
      delete teaser.body;
      return teaser;
    });
}

export async function getJournalCategories(): Promise<readonly JournalCategory[]> {
  return (await source.pageCopy()).journalCategories;
}

/* -- Site settings & navigation ----------------------------------------- */

export async function getSiteSettings(): Promise<SiteSettings> {
  return source.siteSettings();
}

export async function getNavigation(): Promise<Navigation> {
  return source.navigation();
}

/* -- Page copy ----------------------------------------------------------- */

/** The copy blocks one page renders, typed per page. */
export async function getPageContent<K extends PageKey>(page: K): Promise<PageContentMap[K]> {
  const copy = await source.pageCopy();
  const pages: PageContentMap = {
    home: {
      philosophy: copy.philosophy,
      pillars: copy.pillars,
      reasons: copy.reasons,
      peaksToShores: copy.peaksToShores,
      signatureHotels: copy.signatureHotels,
      founder: copy.founder,
      circle: copy.circle,
      services: copy.services,
      speak: copy.speak,
    },
    'our-story': { founder: copy.founder, pillars: copy.pillars },
    destinations: { peaksToShores: copy.peaksToShores },
    experiences: { experiences: await getExperiences() },
    journal: { categories: copy.journalCategories, circle: copy.circle },
  };
  return pages[page];
}

/* -- Media, SEO and journey helpers (re-exported for one import path) ---- */

export { getMedia, isNew, journeyLabel, toSummary, pageMetadata, jsonLd };

/* -- Legacy synchronous exports (formerly src/lib/content.ts) ------------ */

export {
  circle,
  experiences,
  founder,
  journal,
  journalCategories,
  peaksToShores,
  philosophy,
  pillars,
  reasons,
  signatureHotels,
} from '../data/copy';
export type { JournalEntry } from '../data/copy';
