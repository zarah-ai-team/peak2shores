import Link from 'next/link';
import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { TextReveal } from '@/components/motion/TextReveal';
import { SectionLabel, Tick } from '@/components/ui/Editorial';
import { ButtonLink } from '@/components/ui/Button';
import { PeaksToShores } from '@/components/home/PeaksToShores';
import { journeys } from '@/lib/journeys';
import { enterAt } from '@/lib/motion';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Destinations',
  description:
    'Where mountains meet water: the Alps, alpine lakes, the Mediterranean and the Atlantic. The places Peaks2Shores returns to, and the journeys that go there.',
  path: '/destinations',
});

/**
 * A destination is a country we return to, described only by the journeys that
 * actually go there. Nothing is invented — each entry is assembled from the
 * catalogue.
 */
function destinations() {
  const byCountry = new Map<string, typeof journeys>();

  journeys.forEach((journey) => {
    journey.country.split(' & ').forEach((country) => {
      const list = byCountry.get(country) ?? [];
      list.push(journey);
      byCountry.set(country, list);
    });
  });

  return [...byCountry.entries()].map(([country, list]) => ({
    country,
    regions: [...new Set(list.map((j) => j.region))],
    journeys: list,
    media: list[0].listMedia,
  }));
}

export default function DestinationsPage() {
  const places = destinations();

  return (
    <>
      <section
        data-hero
        className="relative isolate flex min-h-[520px] flex-col justify-end overflow-hidden md:h-[80svh] md:min-h-[640px]"
      >
        <div className="absolute inset-0 -z-10">
          <Frame
            media="tr-3"
            priority
            reveal={false}
            drift
            decorative
            sizes="100vw"
            overlay="hero"
            className="h-full"
          />
        </div>
        <div className="gutter pb-14 pt-[140px] text-white md:pb-16">
          <p
            className="enter kicker m-0 mb-7 flex items-center gap-3.5 text-white"
            style={enterAt(0.05)}
          >
            <Tick />
            Where mountains meet water
          </p>
          <TextReveal
            as="h1"
            immediate
            delay={0.15}
            className="h1 max-w-[900px]"
            lines={[{ text: 'A few places,' }, { text: 'known properly.', italic: true }]}
          />
        </div>
      </section>

      <section className="gutter editorial-grid border-b border-line pb-20 pt-20 md:pb-[104px] md:pt-[112px]">
        <SectionLabel className="lg:pt-4">The map</SectionLabel>
        <Reveal variant="mask">
          <h2 className="h2">We would rather return to four countries than pass through forty.</h2>
        </Reveal>
        <Reveal delay={0.12} className="max-w-[440px] lg:pt-4">
          <p className="prose-body mb-5">
            Every destination below is somewhere we have been repeatedly, in different seasons, with
            the same people waiting at the other end. That is what makes an itinerary worth writing.
          </p>
          <ButtonLink href="/journeys" variant="rule">
            See the journeys
          </ButtonLink>
        </Reveal>
      </section>

      <PeaksToShores />

      <section className="gutter pb-20 pt-20 md:pb-[104px] md:pt-[112px]">
        <div className="editorial-grid--wide mb-12 lg:mb-16">
          <SectionLabel className="lg:pt-3">Where we go</SectionLabel>
          <Reveal variant="mask">
            <h2 className="h3 max-w-[820px]">Four countries, and the journeys that know them.</h2>
          </Reveal>
        </div>

        <RevealGroup
          as="ul"
          className="grid list-none gap-x-0.5 gap-y-14 p-0 sm:grid-cols-2 lg:grid-cols-4"
        >
          {places.map((place) => {
            const titleId = `place-${place.country.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <RevealItem as="li" key={place.country} distance={22}>
                <Link href="/journeys" aria-labelledby={titleId} className="group block h-full">
                  <Frame
                    media={place.media}
                    hover
                    decorative
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="h-[320px] lg:h-[420px]"
                  />
                  <div className="mt-0.5 border-t border-line pr-4 pt-6">
                    <h3 id={titleId} className="mb-3 font-display text-[30px] leading-none">
                      {place.country}
                    </h3>
                    <p className="prose-body-sm mb-4 text-[13px]">{place.regions.join(' · ')}</p>
                    <p className="kicker-sm">
                      {place.journeys.length} {place.journeys.length === 1 ? 'journey' : 'journeys'}
                    </p>
                  </div>
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </section>
    </>
  );
}
