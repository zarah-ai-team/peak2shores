import type { Metadata } from 'next';
import { site } from './site';

/**
 * Per-page metadata with the shared Open Graph and Twitter fields filled in.
 *
 * Next replaces a child's `openGraph` and `twitter` objects wholesale rather
 * than merging them with the layout's, so a page that only sets a title and
 * description silently loses `og:site_name`, `og:type`, `og:locale` and its
 * own twitter card copy. Every page goes through this instead.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  noindex = false,
}: {
  title: string;
  description: string;
  /** From the site root, with a leading slash; resolved against metadataBase. */
  path: string;
  type?: 'website' | 'article';
  /** Keep the page out of search while still letting crawlers follow its links. */
  noindex?: boolean;
}): Metadata {
  const fullTitle = `${title} — ${site.name}`;
  return {
    title,
    description,
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    alternates: { canonical: path },
    openGraph: {
      type,
      siteName: site.name,
      locale: 'en_US',
      title: fullTitle,
      description,
      url: path,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  };
}

/**
 * JSON-LD, safe to place inside a <script>.
 *
 * `JSON.stringify` alone would let a `</script>` inside any string end the
 * element early. All the content here is ours, so this is defence in depth
 * rather than a live risk — but it costs nothing.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
