import type { MetadataRoute } from 'next';
import { liveJourneys } from '@/lib/journeys';
import { site } from '@/lib/site';

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    { path: '', priority: 1 },
    { path: '/journeys', priority: 0.9 },
    { path: '/destinations', priority: 0.8 },
    { path: '/experiences', priority: 0.8 },
    { path: '/our-story', priority: 0.7 },
    { path: '/journal', priority: 0.6 },
    { path: '/plan', priority: 0.9 },
    // Listed once Marc's final wording replaces the draft structure.
    ...(site.legalDraft
      ? []
      : ['/privacy', '/cookies', '/terms', '/booking-terms'].map((path) => ({
          path,
          priority: 0.3,
        }))),
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route.path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: route.priority,
    })),
    ...liveJourneys().map((journey) => ({
      url: `${site.url}/journeys/${journey.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
