import Link from 'next/link';
import { JourneyCollection, type CollectionCard } from '@/components/journeys/JourneyCollection';
import { JourneysMap } from '@/components/journeys/JourneysMap';
import { JourneyTabs } from '@/components/journeys/JourneyTabs';
import { DetailsDifference } from '@/components/journeys/DetailsDifference';
import { Faq } from '@/components/ui/Faq';
import { getJourneyBySlug, getJourneySummaries, pageMetadata, type Journey } from '@/lib/content';
import { journeysFaq } from '@/lib/data/faq';
import { flipbook, journeyRank, journeyTint, statusLabel } from '@/lib/data/flipbook';
import { DATES_TBA } from '@/lib/journeys';
import { placePhotos } from '@/components/journeys/placePhotos';
import { site } from '@/lib/site';

/* Rebuilt hourly, so a journey scheduled with `publishAt` appears on time. */
export const revalidate = 3600;

export const metadata = pageMetadata({
  title: 'Small Luxury Group Journeys',
  description:
    'Extraordinary destinations. Intimate groups. Thoughtfully curated experiences. Intimate journeys shared with a small circle of fellow travelers, bringing together exceptional places, meaningful experiences and the joy of discovering the world together.',
  path: '/journeys',
});

/* Each card's photographs (notes of 5 November 2026): real photographs of
   places the journey visits, the client's own first where we have them. */
const cardPhotos: Record<string, { src: string; alt: string }[]> = {
  'swiss-elegance': ['Lucerne', 'Zermatt', 'Grindelwald', 'Montreux', 'Stresa'].map(
    (p) => placePhotos[p],
  ),
  'the-italian-experience': [
    {
      src: '/images/ie-hero.jpg',
      alt: 'The Scaliger Castle at Sirmione rising from the clear water of Lake Garda',
    },
    ...['Venice', 'Bologna', 'Verona', 'Motor Valley'].map((p) => placePhotos[p]),
  ],
  'adriatic-collection': ['Dubrovnik', 'Hvar', 'Rovinj', 'Split', 'Venice'].map(
    (p) => placePhotos[p],
  ),
};

/** A departure month, '2027-06', as the Departure filter names it: "June 2027". */
const monthLabel = (ym: string) =>
  new Date(`${ym}-01T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

/**
 * The Journeys page, after Ishika's notes of 3 November 2026 and the owner's
 * note of 18 November 2026 (start with the Collection; the map as its second
 * view):
 *
 * 1. The Collection, opening the page: the journey cards with their dropdown
 *    filters, and a Cards / Map switch whose Map view is the globe with the
 *    journeys as a carousel (no full-bleed photograph: only the homepage has
 *    one).
 * 2. The in-page menu, pinned under the header.
 * 3. The details that make the difference (moved here from the homepage).
 * 4. Bespoke Private Travel: one slim navy banner.
 * 5. Good to know: the questions. No button of its own since the chat notes
 *    of 9 November 2026: it repeated the floating "Connect with our team".
 *
 * Only the journeys with a page are shown (Marc's three, for launch); the
 * flipbook's coming journeys wait until he confirms them.
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
    const whole = full.find((f) => f.slug === j.slug);
    const imgs = (cardPhotos[j.slug] ?? []).filter(Boolean);
    // The travel style, read from the journey itself.
    const style = [
      j.country.includes('&') ? 'Multi-country' : 'Single country',
      ...(whole?.route?.some((s) => s.by === 'boat') ? ['Includes boat travel'] : []),
      ...(whole?.flyer?.extension ? ['Can be combined with another journey'] : []),
    ];
    // The months it departs in: the ones Marc lists, else the first departure's.
    const months = whole?.departureMonths?.length
      ? whole.departureMonths
      : j.departureISO
        ? [j.departureISO.slice(0, 7)]
        : [];
    // Each place on the route once, in the order the journey reaches it.
    const stops = Array.from(new Set((whole?.route ?? []).map((s) => s.name)));
    return {
      slug: j.slug,
      title: book?.title ?? j.title,
      region: j.country,
      tagline: book?.tagline ?? j.lead,
      blurb: j.blurb,
      dest: j.country.split(' & '),
      inspire: j.inspire,
      days: j.days,
      when: Array.from(new Set(months))
        .filter((ym) => /^\d{4}-(0[1-9]|1[0-2])$/.test(ym))
        .sort()
        .map((ym) => ({ ym, label: monthLabel(ym) })),
      style,
      stops,
      // The tags (chat notes of 9 November 2026): the days, then the rate and
      // the departure (a date or just a year) once Marc sets them. Nothing else.
      facts: [
        `${j.days} days`,
        ...(j.priceFrom ? [`From ${j.priceFrom}`] : []),
        ...(j.departure && j.departure !== DATES_TBA ? [j.departure] : []),
      ],
      status: statusLabel[j.status ?? 'open'] ?? 'Now booking',
      tint: journeyTint[j.slug] ?? '#1d4a66',
      imgs,
    };
  });

  return (
    <>
      <JourneyCollection cards={cards} tba={DATES_TBA} map={<JourneysMap journeys={full} />} />
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
      />
    </>
  );
}
