import Link from 'next/link';
import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { SectionLabel } from '@/components/ui/Editorial';
import type { HomeContent } from '@/lib/content';
import { Section } from '@/components/ui/Section';

/**
 * 4.4b — 04 Also designed for you (ivory, ruled).
 *
 * The other ways to travel with us — private journeys, cruises and yachts,
 * events, villas — as four small tiles: present, but deliberately quieter than
 * the journeys above them. Each leads to the private-travel enquiry on /plan.
 */
export function ServicesStrip({ services }: { services: HomeContent['services'] }) {
  return (
    <Section contained={false} rule pad="section-sm" id="also" aria-labelledby="also-title">
      <div className="container-site">
        <div className="grid-site mb-10 gap-y-6 lg:mb-12 lg:items-end">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <SectionLabel className="mb-6 lg:mb-8">04 — Beyond the journeys</SectionLabel>
            <Reveal variant="mask">
              <h2 id="also-title" className="h3">
                Also designed for you.
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="col-span-4 md:col-span-6 lg:col-span-5 lg:pb-2">
            <p className="prose-body measure">
              When you would rather travel another way, the same care applies.
            </p>
          </Reveal>
        </div>

        <RevealGroup
          as="ul"
          stagger={0.06}
          className="m-0 grid list-none grid-cols-2 gap-x-[var(--grid-gap)] gap-y-10 p-0 lg:grid-cols-4"
        >
          {services.map((service) => (
            <RevealItem as="li" key={service.title} distance={16}>
              <Link href={service.href} className="group block">
                <Frame
                  media={service.media}
                  hover
                  decorative
                  sizes="(min-width: 1024px) 22vw, 45vw"
                  className="aspect-[4/5]"
                />
                <span className="kicker-sm mt-5 flex items-center gap-3 text-muted">
                  {service.n}
                  <span aria-hidden className="frame-caption-rule" />
                </span>
                <span className="h5 mt-2 block">{service.title}</span>
                <span className="prose-body-sm mt-2 block max-w-[34ch]">{service.line}</span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
