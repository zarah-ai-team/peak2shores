import Link from 'next/link';
import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { PhotoHero } from '@/components/ui/PhotoHero';
import { Section } from '@/components/ui/Section';
import { SectionLabel, Tick } from '@/components/ui/Editorial';
import { ButtonLink } from '@/components/ui/Button';
import { DarkCta } from '@/components/ui/DarkCta';
import { StatusTag } from '@/components/ui/StatusTag';
import { PeaksToShores } from '@/components/home/PeaksToShores';
import { journeyTagStatus } from '@/components/pages/journeyStatus';
import { getDestinations, getPageContent, pageMetadata, type Destination } from '@/lib/content';

export const metadata = pageMetadata({
  title: 'Destinations',
  description:
    'Where mountains meet water: the Alps, alpine lakes, the Mediterranean and the Atlantic. The places Peaks2Shores returns to, and the journeys that go there.',
  path: '/destinations',
});

/* Lists journeys, so it is rebuilt hourly with them. */
export const revalidate = 3600;

/**
 * Destinations: a photographic opening, the map statement, the name, then
 * the signature — one chapter per country we return to, each described only
 * by the journeys that go there (nothing is invented; the list is derived
 * from the catalogue by the content provider).
 */
export default async function DestinationsPage() {
  const [places, { peaksToShores }] = await Promise.all([
    getDestinations(),
    getPageContent('destinations'),
  ]);

  return (
    <>
      <PhotoHero
        media="destinations-hero"
        drift
        kicker={
          <span className="flex items-center gap-3.5">
            <Tick />
            Where mountains meet water
          </span>
        }
        title={[{ text: 'A few places,' }, { text: 'known properly.', italic: true }]}
      />

      <Section aria-labelledby="map-title">
        <div className="grid-site gap-y-block">
          <div className="col-span-4 md:col-span-8 lg:col-span-8">
            <SectionLabel className="mb-stack flex items-center gap-3.5">
              <Tick />
              The map
            </SectionLabel>
            <Reveal variant="mask">
              <h2 id="map-title" className="h2 max-w-[20ch]">
                We would rather return to {numberWord(places.length)} countries than pass through
                forty.
              </h2>
            </Reveal>
          </div>
          <Reveal
            delay={0.1}
            className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:self-end"
          >
            <p className="prose-body measure mb-stack">
              Every destination below is somewhere we have been repeatedly, in different seasons,
              with the same people waiting at the other end. That is what makes an itinerary worth
              writing.
            </p>
            <ButtonLink href="/journeys" variant="rule" arrow>
              See the journeys
            </ButtonLink>
          </Reveal>
        </div>
      </Section>

      <PeaksToShores content={peaksToShores} variant="compact" label="The name" />

      <section aria-labelledby="chapters-title" className="pb-section">
        <div className="container-site pt-section-sm">
          <SectionLabel className="mb-stack">Where we go</SectionLabel>
          <Reveal variant="mask" className="mb-block">
            <h2 id="chapters-title" className="h2 max-w-[20ch]">
              {capitalise(numberWord(places.length))} countries, and the journeys that know them.
            </h2>
          </Reveal>
        </div>
        {places.map((place, i) => (
          <Chapter key={place.slug} place={place} index={i} />
        ))}
      </section>

      <DarkCta
        kicker="Private travel"
        headline="Or a journey with only your names on the list."
        body="Families, friends, a milestone. The same hotels, the same people on the ground, on your dates. Start with a conversation, not a form."
        href="/plan#private"
        cta="Plan your journey"
      />
    </>
  );
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const numberWord = (n: number) => WORDS[n] ?? String(n);
const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * One country. Even chapters open on a panorama across the page; odd ones
 * set a portrait beside the text — so no two neighbours share a skeleton.
 */
function Chapter({ place, index }: { place: Destination; index: number }) {
  const panorama = index % 2 === 0;
  const titleId = `${place.slug}-title`;

  const heading = (
    <div className="col-span-4 md:col-span-8 lg:col-span-7">
      <p className="kicker mb-5">
        {String(index + 1).padStart(2, '0')} · {place.regions.join(' · ')}
      </p>
      <Reveal variant="mask">
        <h3
          id={titleId}
          className="display font-medium"
          style={{ fontSize: 'clamp(56px, 8vw, 120px)' }}
        >
          {place.country}
        </h3>
      </Reveal>
    </div>
  );

  const list = (
    <RevealGroup
      as="ul"
      className="col-span-4 m-0 list-none border-t border-line p-0 md:col-span-8 lg:col-span-5 lg:col-start-8"
    >
      {place.journeys.map((journey) => {
        const tag = journeyTagStatus(journey);
        return (
          <RevealItem as="li" key={journey.slug} distance={12} className="border-b border-line">
            <Link
              href={`/journeys/${journey.slug}`}
              className="group flex min-h-11 items-baseline justify-between gap-6 py-5"
            >
              <span className="min-w-0">
                <span className="h5 block transition-colors duration-300 group-hover:text-acqua-text">
                  {journey.title}
                </span>
                <span className="kicker-sm mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>
                    {journey.days} days · {journey.departure}
                  </span>
                  {tag !== 'open' && <StatusTag status={tag} />}
                </span>
              </span>
              <span aria-hidden className="link-rule min-h-0 shrink-0 py-0">
                View
              </span>
            </Link>
          </RevealItem>
        );
      })}
    </RevealGroup>
  );

  if (panorama) {
    return (
      <article id={place.slug} aria-labelledby={titleId} className="pb-section-sm">
        <Frame
          media={place.media}
          decorative
          sizes="100vw"
          className="mb-block aspect-[4/3] w-full md:aspect-[21/9]"
        />
        <div className="container-site grid-site items-end gap-y-block">
          {heading}
          {list}
        </div>
      </article>
    );
  }

  return (
    <article id={place.slug} aria-labelledby={titleId} className="pb-section-sm">
      <div className="container-site grid-site items-end gap-y-block">
        <Frame
          media={place.media}
          ratio="4/5"
          decorative
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="col-span-4 md:col-span-6 lg:col-span-6"
        />
        <div className="col-span-4 flex flex-col gap-block md:col-span-8 lg:col-span-5 lg:col-start-8">
          <div>
            <p className="kicker mb-5">
              {String(index + 1).padStart(2, '0')} · {place.regions.join(' · ')}
            </p>
            <Reveal variant="mask">
              <h3
                id={titleId}
                className="display font-medium"
                style={{ fontSize: 'clamp(56px, 8vw, 120px)' }}
              >
                {place.country}
              </h3>
            </Reveal>
          </div>
          {list}
        </div>
      </div>
    </article>
  );
}
