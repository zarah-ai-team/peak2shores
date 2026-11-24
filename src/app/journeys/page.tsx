import Link from 'next/link';
import { JourneyCollection } from '@/components/journeys/JourneyCollection';
import { JourneysHero } from '@/components/journeys/JourneysHero';
import { JourneysMap } from '@/components/journeys/JourneysMap';
import { JourneyTabs } from '@/components/journeys/JourneyTabs';
import { DetailsDifference } from '@/components/journeys/DetailsDifference';
import { Faq } from '@/components/ui/Faq';
import { getJourneys, pageMetadata } from '@/lib/content';
import { journeysFaq } from '@/lib/data/faq';
import { journeyRank } from '@/lib/data/flipbook';
import { toCollectionCard } from '@/lib/journeyCards';
import { DATES_TBA } from '@/lib/journeys';

/* Rebuilt hourly, so a journey scheduled with `publishAt` appears on time. */
export const revalidate = 3600;

export const metadata = pageMetadata({
  title: 'Small Luxury Group Journeys',
  description:
    'Extraordinary destinations. Intimate groups. Thoughtfully curated experiences. Intimate journeys shared with a small circle of fellow travelers, bringing together exceptional places, meaningful experiences and the joy of discovering the world together.',
  path: '/journeys',
});

/**
 * The Journeys page, after Ishika's notes of 9 November 2026 and the owner's
 * decisions of 18 November 2026:
 *
 * 1. The hero, half and half: the page's words on the navy, one photograph
 *    beside them (JourneysHero).
 * 2. The in-page menu, straight after it and pinned under the header once
 *    passed. Its tabs alone: no "Request details".
 * 3. The Collection: the journey cards with their dropdown filters, and a
 *    Cards / Map switch whose Map view is the globe with the journeys as a
 *    carousel.
 * 4. The details that make the difference.
 * 5. Bespoke Private Travel: one slim navy banner with one button.
 * 6. Good to know: the questions. No button of its own since the chat notes
 *    of 9 November 2026: it repeated the floating "Connect with our team".
 *
 * Only the journeys with a page are shown (Marc's three, for launch); the
 * flipbook's coming journeys wait until he confirms them.
 */
export default async function JourneysPage() {
  // The full journeys stay on the server: the cards and the map take only
  // what they show.
  const journeys = (await getJourneys())
    .filter((j) => j.status !== 'past')
    .sort((a, b) => journeyRank(a.slug) - journeyRank(b.slug));

  return (
    <>
      <JourneysHero />
      <JourneyTabs
        label="On this page"
        tabs={[
          { id: 'collection', label: 'Our journeys' },
          { id: 'experience', label: 'The Peaks2Shores Experience' },
          { id: 'private', label: 'Bespoke private travel' },
          { id: 'faq', label: 'Good to know' },
        ]}
      />
      <JourneyCollection
        cards={journeys.map(toCollectionCard)}
        tba={DATES_TBA}
        map={<JourneysMap journeys={journeys} />}
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
          {/* `data-fab-clear`: the floating "Connect with our team" steps aside
              rather than cover the button. */}
          <div className="jxb-ctas" data-fab-clear>
            <Link className="jxb-btn solid" href="/plan#private">
              Bespoke Private Travel
            </Link>
          </div>
        </div>
      </section>

      {/* On a phone and a tablet the questions start on the page's own
          gutter, in line with every section above them (a laptop keeps the
          site container's). */}
      <Faq
        items={journeysFaq}
        label="Good to know"
        title="Frequently asked questions"
        className="pt-section-sm max-lg:px-[clamp(1.25rem,3.39vw,4rem)] pointer-coarse:px-[clamp(1.25rem,3.39vw,4rem)]"
      />
    </>
  );
}
