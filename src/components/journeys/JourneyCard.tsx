import Link from 'next/link';
import { Frame } from '@/components/ui/Frame';
import { RevealItem } from '@/components/motion/Reveal';
import type { JourneySummary } from '@/lib/journeys';

/**
 * The editorial journey card: a tall photograph, a metadata rule above the
 * title, and a costed footer. No shadow, no radius, no button — the whole
 * card is the link, named by its title.
 *
 * Under the pointer the photograph eases in a few percent and a closing line
 * arrives beneath the price. The card itself stays flat and aligned.
 */
export function JourneyCard({ journey }: { journey: JourneySummary }) {
  const titleId = `card-${journey.slug}-title`;

  return (
    <RevealItem as="li" distance={22}>
      <Link
        href={`/journeys/${journey.slug}`}
        aria-labelledby={titleId}
        className="group block pt-0.5 transition-colors duration-300 hover:bg-panel"
      >
        <Frame
          media={journey.cardMedia}
          hover
          decorative
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="h-[380px] sm:h-[440px] lg:h-[560px]"
        />
        <div className="pb-10 pr-6 pt-7">
          <div className="kicker-sm mb-4 flex justify-between gap-4">
            <span>{journey.country}</span>
            <span className="text-right">
              {journey.days} days · max. {journey.groupMax}
            </span>
          </div>
          <h3 id={titleId} className="h4 mb-3.5">
            {journey.title}
          </h3>
          <p className="prose-body-sm mb-5">{journey.blurb}</p>
          <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4 font-ui text-[12px] font-normal text-body">
            <span>{journey.departureWindow}</span>
            <span className="text-right text-muted">From {journey.priceFrom} per person</span>
          </div>
          <span className="card-cta kicker-sm mt-5 block text-ink">View the journey</span>
        </div>
      </Link>
    </RevealItem>
  );
}
