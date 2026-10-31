import { JourneyCollection, type CollectionCard } from '@/components/journeys/JourneyCollection';
import { ExpertPanel } from '@/components/journeys/ExpertPanel';
import { getJourneySummaries, pageMetadata } from '@/lib/content';
import { comingSoon, flipbook, journeyRank, journeyTint, statusLabel } from '@/lib/data/flipbook';
import { DATES_TBA } from '@/lib/journeys';
import { getMedia, type MediaKey } from '@/lib/media';

/* Rebuilt hourly, so a journey scheduled with `publishAt` appears on time. */
export const revalidate = 3600;

export const metadata = pageMetadata({
  title: 'Small Luxury Group Journeys',
  description:
    'Intimate journeys for never more than 18 guests — exceptional places, meaningful experiences and the joy of discovering the world together, each one somewhere Marc Haeni knows well.',
  path: '/journeys',
});

/* The homepage's frame for each journey leads its card here too. */
const leadFrames: Record<string, MediaKey> = {
  'swiss-elegance': 'home-jr-swiss',
  'the-italian-experience': 'home-jr-italy',
  'adriatic-collection': 'ac-hero',
};

export default async function JourneysPage() {
  // Summaries only: the itineraries never need to cross to the browser.
  const journeys = (await getJourneySummaries())
    .filter((j) => j.status !== 'past')
    .sort((a, b) => journeyRank(a.slug) - journeyRank(b.slug));

  const cards: CollectionCard[] = [
    ...journeys.map((j) => {
      const book = flipbook[j.slug];
      // Every distinct photograph the journey has, its lead frame first.
      const keys = [leadFrames[j.slug], j.listMedia, j.cardMedia, j.promoMedia].filter(
        (k): k is MediaKey => Boolean(k),
      );
      const imgs = Array.from(
        new Map(
          keys
            .map((k) => getMedia(k))
            .filter((m) => m.src)
            .map((m) => [m.src as string, { src: m.src as string, alt: m.alt ?? m.label }]),
        ).values(),
      );
      return {
        slug: j.slug,
        title: book?.title ?? j.title,
        region: j.country,
        tagline: book?.tagline ?? j.lead,
        blurb: j.blurb,
        dest: j.country.split(' & '),
        inspire: j.inspire,
        days: j.days,
        facts: [
          `${j.days} days`,
          `Max. ${j.groupMax} guests`,
          ...(j.departure && j.departure !== DATES_TBA ? [j.departure] : []),
        ],
        priceFrom: j.priceFrom,
        status: statusLabel[j.status ?? 'open'] ?? 'Now booking',
        tint: journeyTint[j.slug] ?? '#1d4a66',
        imgs,
      };
    }),
    ...comingSoon.map((c) => ({
      slug: c.slug,
      title: c.title,
      region: c.region,
      tagline: c.tagline,
      blurb: '',
      dest: c.dest,
      inspire: c.inspire,
      facts: ['Small group', 'Max. 18 guests'],
      status: 'Coming soon',
      soon: true,
      tint: c.tint,
      imgs: [{ src: c.photo.src, alt: c.photo.alt }, ...(c.more ?? [])],
    })),
  ];

  return (
    <>
      <JourneyCollection
        cards={cards}
        journeys={journeys}
        film={{
          src: '/video/home/reel-rail.mp4',
          poster: '/images/home/reel-rail.jpg',
          label: 'Switzerland, by rail',
        }}
      />
      <ExpertPanel />
    </>
  );
}
