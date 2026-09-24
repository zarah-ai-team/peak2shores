import type { MetadataRoute } from 'next';
import { journeys } from '@/lib/journeys';
import { site } from '@/lib/site';

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
  ];

  return [
    ...staticRoutes.map((route) => ({
      url: `${site.url}${route.path}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: route.priority,
    })),
    ...journeys.map((journey) => ({
      url: `${site.url}/journeys/${journey.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
