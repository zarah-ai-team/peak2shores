import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { SectionLabel } from '@/components/ui/Editorial';
import type { HomeContent } from '@/lib/content';
import { Section } from '@/components/ui/Section';
import { HotelCard } from './HotelCard';

/**
 * 4.7 — 08 Hotels (ivory).
 *
 * Three hotels as large photographs — big enough to sell the place, which the
 * ledger's thumbnails were not (client review, October 2026). Each card turns
 * over on hover, focus or tap to the case for the hotel, its signature detail
 * and what is nearby. The hotels are described, not named or claimed as
 * partners — exactly as the copy has it.
 */
export function HotelsStrip({ hotels }: { hotels: HomeContent['signatureHotels'] }) {
  return (
    <Section contained={false} id="hotels" aria-labelledby="hotels-title">
      <div className="container-site">
        <div className="grid-site mb-block gap-y-8 lg:items-end">
          <div className="col-span-4 md:col-span-8 lg:col-span-8">
            <SectionLabel className="mb-8 lg:mb-10">08 — Where you stay</SectionLabel>
            <Reveal variant="mask">
              <h2 id="hotels-title" className="h2 max-w-[20ch]">
                We don’t simply book hotels. We choose where you spend your time.
              </h2>
            </Reveal>
          </div>
          <Reveal
            delay={0.1}
            className="col-span-4 md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9 lg:pb-3"
          >
            <p className="prose-body">
              Each one earned its place for a reason we can name. Hover or tap a hotel to turn it
              over.
            </p>
          </Reveal>
        </div>

        <RevealGroup
          as="ul"
          stagger={0.08}
          className="m-0 grid list-none gap-[var(--grid-gap)] p-0 md:grid-cols-2 lg:grid-cols-3"
        >
          {hotels.map((hotel, i) => (
            <RevealItem
              as="li"
              key={hotel.name}
              distance={16}
              className={i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}
            >
              <HotelCard hotel={hotel} index={i} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
