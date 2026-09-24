import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { MetaItem, SectionLabel } from '@/components/ui/Editorial';
import { signatureHotels } from '@/lib/content';

/**
 * The hotels as a ledger: numbered rows under a rule, a small portrait
 * photograph at the head of each, the case for the hotel beside it and its
 * particulars in the last column. It reads as a page from the black book —
 * compact, and different in kind from the spreads above it.
 */
export function HotelsStrip() {
  return (
    <section className="gutter border-b border-line bg-panel pb-20 pt-20 md:pb-[112px] md:pt-[112px]">
      <div className="editorial-grid mb-12 lg:mb-16">
        <SectionLabel className="lg:pt-3">08 — Hotels</SectionLabel>
        <Reveal variant="mask">
          <h2 className="h3">We don’t simply book hotels. We choose where you spend your time.</h2>
        </Reveal>
        <Reveal delay={0.12} className="lg:pt-3">
          <p className="prose-body max-w-[440px]">
            The hotel is part of the journey, not a place to sleep before an early departure. Each
            one below earned its place for a reason we can name.
          </p>
        </Reveal>
      </div>

      <RevealGroup as="ol" className="m-0 list-none border-t border-line p-0" stagger={0.08}>
        {signatureHotels.map((hotel, i) => (
          <RevealItem
            as="li"
            key={hotel.name}
            distance={18}
            className="grid gap-6 border-b border-line py-9 sm:grid-cols-2 lg:grid-cols-[56px_200px_minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-12 lg:py-10"
          >
            <div className="kicker pt-1 sm:col-span-2 lg:col-span-1">0{i + 1}</div>
            <Frame
              media={hotel.media}
              decorative
              sizes="(min-width: 1024px) 200px, (min-width: 640px) 50vw, 100vw"
              className="aspect-[3/2] sm:aspect-[4/5]"
            />
            <div className="max-w-[520px]">
              <div className="kicker-sm mb-3">{hotel.place}</div>
              <h3 className="h5 mb-4">{hotel.name}</h3>
              <p className="prose-body-sm">{hotel.why}</p>
            </div>
            <div className="grid gap-5 sm:col-span-2 sm:grid-cols-2 lg:col-span-1 lg:grid-cols-1 lg:pt-1">
              <MetaItem label="Signature detail">{hotel.detail}</MetaItem>
              <MetaItem label="Nearby">{hotel.nearby}</MetaItem>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
