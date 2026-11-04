import Link from 'next/link';
import { JourneyCollection, type CollectionCard } from '@/components/journeys/JourneyCollection';
import { JourneysHero } from '@/components/journeys/JourneysHero';
import { JourneyTabs } from '@/components/journeys/JourneyTabs';
import { DetailsDifference } from '@/components/journeys/DetailsDifference';
import { Faq } from '@/components/ui/Faq';
import { getJourneyBySlug, getJourneySummaries, pageMetadata, type Journey } from '@/lib/content';
import { journeysFaq } from '@/lib/data/faq';
import { flipbook, journeyRank, journeyTint, statusLabel } from '@/lib/data/flipbook';
import { DATES_TBA } from '@/lib/journeys';
import { getMedia, type MediaKey } from '@/lib/media';
import { site } from '@/lib/site';

/* Rebuilt hourly, so a journey scheduled with `publishAt` appears on time. */
export const revalidate = 3600;

export const metadata = pageMetadata({
  title: 'Small Luxury Group Journeys',
  description:
    'Extraordinary destinations. Intimate groups. Thoughtfully curated experiences. Intimate journeys shared with a small circle of fellow travelers, bringing together exceptional places, meaningful experiences and the joy of discovering the world together.',
  path: '/journeys',
});

/* The homepage's frame for each journey leads its card here too. */
const leadFrames: Record<string, MediaKey> = {
  'swiss-elegance': 'home-jr-swiss',
  'the-italian-experience': 'home-jr-italy',
  'adriatic-collection': 'ac-hero',
};

/**
 * The Journeys page, after Ishika's notes of 3 November 2026:
 *
 * 1. The page's name over a wide map of the region, the journeys under it as
 *    a carousel (no full-bleed photograph: only the homepage has one).
 * 2. The in-page menu, pinned under the header.
 * 3. The details that make the difference (moved here from the homepage).
 * 4. The Collection: dropdown filters and the journey cards.
 * 5. Bespoke Private Travel: one slim navy banner.
 * 6. Good to know: the questions, with "Connect with our team" beside them.
 *
 * Only the journeys with a page are shown (Marc's three, for launch); the
 * flipbook's coming journeys wait until he confirms them. The globe returns
 * later as the Collection's Map view.
 */
export default async function JourneysPage() {
  // Summaries only for the cards: the itineraries never need to cross to the browser.
  const journeys = (await getJourneySummaries())
    .filter((j) => j.status !== 'past')
    .sort((a, b) => journeyRank(a.slug) - journeyRank(b.slug));
  // The full journeys, on the server, for the routes on the map.
  const full = (await Promise.all(journeys.map((j) => getJourneyBySlug(j.slug)))).filter(
    (j): j is Journey => Boolean(j),
  );

  const cards: CollectionCard[] = journeys.map((j) => {
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
        site.groupSize,
        ...(j.departure && j.departure !== DATES_TBA ? [j.departure] : []),
      ],
      priceFrom: j.priceFrom,
      status: statusLabel[j.status ?? 'open'] ?? 'Now booking',
      tint: journeyTint[j.slug] ?? '#1d4a66',
      imgs,
    };
  });

  return (
    <>
      <JourneysHero journeys={full} />
      <JourneyTabs
        label="On this page"
        tabs={[
          { id: 'collection', label: 'Our journeys' },
          { id: 'experience', label: 'The Peaks2Shores Experience' },
          { id: 'private', label: 'Bespoke private travel' },
          { id: 'faq', label: 'Good to know' },
        ]}
        cta="Request details"
        ctaHref="/plan#contact"
      />
      <DetailsDifference />
      <JourneyCollection cards={cards} />

      <section className="jxb" id="private" aria-labelledby="jxb-h">
        <div className="jxb-in">
          <div>
            <p className="jxb-lab">Bespoke Private Travel</p>
            <h2 id="jxb-h">Or a journey with only your names on the list.</h2>
            <p>
              Not sure which one is yours? Our team will help you choose the right journey — or
              design one around you.
            </p>
          </div>
          <div className="jxb-ctas">
            <Link className="jxb-btn solid" href="/plan#private">
              Bespoke Private Travel
            </Link>
            <a className="jxb-btn" href={`mailto:${site.email}`}>
              Connect with our team
            </a>
          </div>
        </div>
      </section>

      <Faq
        items={journeysFaq}
        label="Good to know"
        title="Frequently asked questions"
        className="pt-section-sm"
        aside={
          <a className="jxb-connect" href={`mailto:${site.email}`}>
            Connect with our team <span aria-hidden>→</span>
          </a>
        }
      />
    </>
  );
}
