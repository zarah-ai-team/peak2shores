import Link from 'next/link';
import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { FactList, PageTitle, SectionLabel, Tick } from '@/components/ui/Editorial';
import { EnquiryForm } from '@/components/journeys/EnquiryForm';
import { journeys } from '@/lib/journeys';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = pageMetadata({
  title: 'Plan your journey',
  description:
    'Start with a conversation, not a form. Join a departure, or design a private journey on your own dates with the same hotels and the same people on the ground.',
  path: '/plan',
});

export default function PlanPage() {
  return (
    <>
      <PageTitle kicker="Plan your journey" title="Start with a conversation.">
        Join one of this year’s departures, or design a private journey on your own dates. Either
        way it begins the same way — you tell us a little, and Marc calls you.
      </PageTitle>

      <section
        id="private"
        aria-labelledby="private-title"
        className="grid border-y border-line lg:grid-cols-2"
      >
        <Frame
          media="tr-2"
          parallax={32}
          decorative
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="min-h-[320px] lg:min-h-[620px]"
        />
        <Reveal
          direction="left"
          distance={24}
          className="gutter flex flex-col justify-center gap-7 py-20 lg:py-[100px] lg:pr-24"
        >
          <SectionLabel className="flex items-center gap-3.5">
            <Tick />
            Private &amp; custom travel
          </SectionLabel>
          <h2 id="private-title" className="h3 max-w-[520px]">
            A journey with only your names on the list.
          </h2>
          <p className="prose-body max-w-[460px]">
            Families, friends, a milestone. The same hotels, the same people on the ground, on your
            dates. Most of our journeys began as a request like this.
          </p>
          <FactList
            labelWidth={130}
            className="max-w-[460px]"
            rows={[
              { label: 'Group size', value: `Up to ${site.maxGuests} guests` },
              { label: 'Where', value: 'Italy · Switzerland · Spain · South Africa' },
              { label: 'Lead time', value: 'Six months is comfortable; less is often possible' },
            ]}
          />
        </Reveal>
      </section>

      <section className="gutter border-b border-line pb-20 pt-20 md:pb-24 md:pt-24">
        <div className="editorial-grid--wide mb-10 lg:mb-14">
          <SectionLabel className="lg:pt-3">This year’s departures</SectionLabel>
          <Reveal variant="mask">
            <h2 className="h4 max-w-[720px]">
              Or take a place on a journey that is already going.
            </h2>
          </Reveal>
        </div>
        <RevealGroup
          as="ul"
          className="m-0 flex list-none flex-col border-t border-line p-0"
          stagger={0.06}
        >
          {journeys.map((journey) => (
            <RevealItem as="li" key={journey.slug} distance={12} className="border-b border-line">
              <Link
                href={`/journeys/${journey.slug}`}
                className="group grid gap-3 py-6 transition-colors duration-300 hover:bg-panel sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-8"
              >
                <span className="font-display text-[clamp(22px,2.2vw,30px)] leading-[1.2] transition-colors duration-300 group-hover:text-acqua-text">
                  {journey.title}
                </span>
                <span className="kicker-sm flex flex-wrap gap-x-6 gap-y-2 sm:justify-end">
                  <span>
                    {journey.country} · {journey.days} days
                  </span>
                  <span>{journey.departure}</span>
                  <span>{journey.priceFrom} pp</span>
                </span>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </section>

      <EnquiryForm
        headline="Tell us a little. We’ll call you, not the other way round."
        intro="Whether it’s a departure on the list or something we have not planned yet, this is where it starts. Enquiring holds nothing and commits you to nothing."
      />
    </>
  );
}
