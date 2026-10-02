import { Reveal, RevealGroup } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/Editorial';
import { JourneyCard } from '@/components/journeys/JourneyCard';
import { featuredJourneys, toSummary } from '@/lib/journeys';

export function FeaturedJourneys() {
  return (
    <section
      id="journeys"
      className="gutter border-b border-line pb-20 pt-20 md:pb-[104px] md:pt-[112px]"
    >
      <div className="mb-12 grid gap-6 lg:mb-[72px] lg:grid-cols-[140px_minmax(0,1fr)_auto] lg:items-end lg:gap-14">
        <SectionLabel className="lg:pb-2.5">03 — Journeys</SectionLabel>
        <Reveal variant="mask">
          <h2 className="h3 max-w-[720px]">A few journeys a year. Each one we’d take ourselves.</h2>
        </Reveal>
        <Reveal delay={0.2} distance={10} className="lg:mb-2.5">
          <ButtonLink href="/journeys" variant="rule">
            All journeys
          </ButtonLink>
        </Reveal>
      </div>

      <RevealGroup
        as="ul"
        className="grid list-none gap-x-0.5 gap-y-14 border-t border-line p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-0"
        stagger={0.1}
      >
        {featuredJourneys().map((journey) => (
          <JourneyCard key={journey.slug} journey={toSummary(journey)} />
        ))}
      </RevealGroup>
    </section>
  );
}
