import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/Editorial';
import { Section } from '@/components/ui/Section';
import { JourneyCard } from '@/components/journeys/JourneyCard';
import type { JourneySummary } from '@/lib/content';
import type { MediaKey } from '@/lib/media';

/* One bright frame per journey of its own, so no photograph on the homepage
   is shown twice (the Journeys index and each journey's page open on others).
   A journey without one falls back to its list frame. */
const homeFrames: Record<string, MediaKey> = {
  'the-swiss-lakes': 'dep-swiss-lakes',
  'amalfi-slowly': 'dep-amalfi',
  'como-and-the-engadin': 'dep-como',
  'mallorca-beyond-the-coast': 'dep-mallorca',
  'the-cape-unhurried': 'dep-cape',
};

/** What sets a Peaks2Shores group apart, said once above the journeys. */
const promises = [
  { title: 'Never more than 18 guests', line: 'Small enough for every table, boat and doorway.' },
  {
    title: 'Personally curated',
    line: 'Places Marc knows well, and people he has known for years.',
  },
  { title: 'Thoughtfully paced', line: 'Fewer moves, longer stays, and free time on purpose.' },
];

/** How many cards lead two to a row so every row of three is full. */
const leadCount = (n: number) => (n % 3 === 2 ? 2 : n % 3 === 1 ? Math.min(4, n) : 0);

/**
 * 03 — Small Luxury Group Journeys, after A&K's small-group pages: the promise
 * in three lines, then every departure still to come as a card — dates, group
 * size and price on each, so they compare at a glance — in date order. This is
 * the "all departures" list too; the two were consolidated in Marc's update
 * of 23 October 2026.
 */
export function FeaturedJourneys({ journeys }: { journeys: JourneySummary[] }) {
  const upcoming = journeys
    .filter((j) => j.status !== 'past')
    .sort((a, b) => a.departureISO.localeCompare(b.departureISO));
  if (upcoming.length === 0) return null;

  return (
    <Section contained={false} id="journeys" aria-labelledby="journeys-title">
      <div className="container-site">
        <div className="grid-site mb-block gap-y-8 lg:items-end">
          <div className="col-span-4 md:col-span-6 lg:col-span-8">
            <SectionLabel className="mb-8 lg:mb-10">Small Luxury Group Journeys</SectionLabel>
            <Reveal variant="mask">
              <h2 id="journeys-title" className="h2 max-w-[20ch]">
                A few journeys a year. Each one we’d take ourselves.
              </h2>
            </Reveal>
          </div>
          <Reveal
            delay={0.15}
            distance={10}
            className="col-span-4 md:col-span-2 md:justify-self-end lg:col-span-4 lg:pb-3"
          >
            <ButtonLink href="/journeys" variant="rule" arrow>
              View all journeys
            </ButtonLink>
          </Reveal>
        </div>

        <RevealGroup
          as="ul"
          stagger={0.08}
          className="m-0 mb-block grid list-none gap-6 border-y border-line p-0 py-7 md:grid-cols-3 md:gap-10"
        >
          {promises.map((p) => (
            <RevealItem as="li" key={p.title} distance={12}>
              <h3 className="h5 m-0 mb-1.5">{p.title}</h3>
              <p className="prose-body-sm m-0">{p.line}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Rows of three on a wide screen, with the soonest departures set two
            to a row where a count would leave the last row short — five read
            as two over three, never three over two and a gap. The list is
            tall, so it starts to arrive as soon as its top is in view. */}
        <RevealGroup
          as="ul"
          stagger={0.08}
          amount={0.02}
          className="m-0 grid list-none gap-x-8 gap-y-16 p-0 sm:grid-cols-2 lg:grid-cols-6"
        >
          {upcoming.map((journey, i) => {
            const wide = i < leadCount(upcoming.length);
            return (
              <RevealItem
                as="li"
                key={journey.slug}
                distance={18}
                className={wide ? 'lg:col-span-3' : 'lg:col-span-2'}
              >
                <JourneyCard journey={journey} media={homeFrames[journey.slug]} wide={wide} />
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </Section>
  );
}
