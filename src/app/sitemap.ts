import type { MetadataRoute } from 'next';
import { getJourneys, getPublishedArticles, getSiteSettings } from '@/lib/content';
import { wayPages } from '@/lib/data/ways';

/* Rebuilt hourly, so a journey is listed within the hour of its release. */
export const revalidate = 3600;

/**
 * Only what a visitor can reach and search should list: live journeys (never
 * scheduled ones), the journal once it has a published piece, and the final
 * legal pages. Pages kept out of search (/links, /credits, /cookies,
 * /booking-terms) and the API are left out.
 *
 * Journal pieces have no address yet (every entry is a draft and there is no
 * /journal/[slug] route). When that route ships, add
 * `getPublishedArticles()` here — never before, or the sitemap would list 404s.
 *
 * `lastModified` is given only where it is known (a journey's release time).
 * A timestamp that changes on every rebuild tells search engines nothing and
 * teaches them to ignore the field.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, journeys, articles] = await Promise.all([
    getSiteSettings(),
    getJourneys(),
    getPublishedArticles(),
  ]);
  // The static build serves each page as a folder, so its addresses (and the
  // canonical URLs Next writes) end in a slash; the sitemap must match them.
  const slash = process.env.NEXT_PUBLIC_STATIC_EXPORT === '1' ? '/' : '';
  const url = (path: string) => `${site.url}${path}${slash}`;

  const staticRoutes = [
    { path: '', priority: 1 },
    { path: '/journeys', priority: 0.9 },
    { path: '/plan', priority: 0.9 },
    { path: '/destinations', priority: 0.8 },
    { path: '/experiences', priority: 0.8 },
    ...wayPages.map((w) => ({ path: `/experiences/${w.slug}`, priority: 0.7 })),
    { path: '/where-we-stay', priority: 0.7 },
    { path: '/our-story', priority: 0.7 },
    ...(articles.length ? [{ path: '/journal', priority: 0.6 }] : []),
    { path: '/privacy', priority: 0.3 },
    { path: '/terms', priority: 0.3 },
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: url(route.path),
      changeFrequency: 'monthly' as const,
      priority: route.priority,
    })),
    ...journeys.map((journey) => ({
      url: url(`/journeys/${journey.slug}`),
      ...(journey.publishAt ? { lastModified: new Date(journey.publishAt) } : {}),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
