import type { Metadata } from 'next';
import { getMedia, type MediaKey } from './media';
import { site } from './site';

/** Matches app/opengraph-image.alt.txt. */
const siteShareAlt = `${site.name} — Luxury travel, personally curated. The Amalfi coast from the sea.`;

/**
 * Per-page metadata with the shared Open Graph and Twitter fields filled in.
 *
 * Next replaces a child's `openGraph` and `twitter` objects wholesale rather
 * than merging them with the layout's, so a page that only sets a title and
 * description silently loses `og:site_name`, `og:type`, `og:locale`, its own
 * twitter card copy and the share image in app/opengraph-image.jpg. Every page
 * goes through this instead, so every page has a share image: its own
 * photograph when one is named, else the site's.
 */
export function pageMetadata({
  title,
  description,
  path,
  type = 'website',
  noindex = false,
  image,
}: {
  title: string;
  description: string;
  /** From the site root, with a leading slash; resolved against metadataBase. */
  path: string;
  type?: 'website' | 'article';
  /** Keep the page out of search while still letting crawlers follow its links. */
  noindex?: boolean;
  /** The photograph to share the page with. Defaults to the site's share image. */
  image?: MediaKey;
}): Metadata {
  const fullTitle = `${title} — ${site.name}`;
  const photo = image ? getMedia(image) : undefined;
  const images = [
    photo?.src
      ? { url: photo.src, alt: photo.alt ?? title }
      : { url: '/opengraph-image.jpg', alt: siteShareAlt },
  ];
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
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images,
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
