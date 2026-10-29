import Link from 'next/link';
import { Faq } from '@/components/ui/Faq';
import { planFaq } from '@/lib/data/faq';
import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { FactList, PageTitle, SectionLabel, Tick } from '@/components/ui/Editorial';
import { Section } from '@/components/ui/Section';
import { StatusTag } from '@/components/ui/StatusTag';
import { EnquiryForm } from '@/components/journeys/EnquiryForm';
import { journeyTagStatus } from '@/components/pages/journeyStatus';
import {
  getDestinations,
  getEnquirableJourneyTitles,
  getJourneySummaries,
  getSiteSettings,
  pageMetadata,
  type JourneySummary,
} from '@/lib/content';

/* Rebuilt hourly, so a journey scheduled with `publishAt` appears on time. */
export const revalidate = 3600;

export const metadata = pageMetadata({
  title: 'Plan your journey',
  description:
    'Start with a conversation, not a form. Join a departure, or design a private journey on your own dates with the same hotels and the same people on the ground.',
  path: '/plan',
});

export default async function PlanPage() {
  const [journeys, titles, destinations, site] = await Promise.all([
    getJourneySummaries(),
    getEnquirableJourneyTitles(),
    getDestinations(),
    getSiteSettings(),
  ]);

  return (
    <>
      <PageTitle kicker="Plan your journey" title="Start with a conversation.">
        Join one of our upcoming departures, or design a private journey on your own dates. Either
        way it begins the same way — you tell us a little, and our team takes it from there.
      </PageTitle>

      <Section ground="stone" pad="section-sm" id="private" aria-labelledby="private-title">
        <div className="grid-site items-center gap-y-block">
          <Frame
            media="plan-private"
            ratio="4/5"
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="col-span-4 md:col-span-5 lg:col-span-5"
          />
          <Reveal className="col-span-4 md:col-span-7 lg:col-span-6 lg:col-start-7">
            <SectionLabel tone="stone" className="mb-stack flex items-center gap-3.5">
              <Tick />
              Private &amp; custom travel
            </SectionLabel>
            <h2 id="private-title" className="h2 mb-stack max-w-[18ch]">
              A journey with only your names on the list.
            </h2>
            <p className="prose-body measure mb-block">
              Families, friends, a milestone. The same hotels, the same people on the ground, on
              your dates. Most of our journeys began as a request like this.
            </p>
            <FactList
              labelWidth={130}
              tone="stone"
              className="max-w-[35rem]"
              rows={[
                { label: 'Group size', value: `Max. ${site.maxGuests} guests` },
                { label: 'Where', value: destinations.map((d) => d.country).join(' · ') },
                { label: 'Lead time', value: 'Six months is comfortable; less is often possible' },
              ]}
            />
          </Reveal>
        </div>
      </Section>

      <Section pad="section-sm" aria-labelledby="departures-title">
        <div className="mb-block flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel className="mb-stack">Upcoming departures</SectionLabel>
            <Reveal variant="mask">
              <h2 id="departures-title" className="h2 max-w-[24ch]">
                Or take a place on a journey that is already going.
              </h2>
            </Reveal>
          </div>
        </div>
        <Ledger journeys={journeys.filter((journey) => journey.status !== 'past')} />
      </Section>

      <EnquiryForm
        journeyOptions={titles}
        headline="Tell us a little. We’ll call you, not the other way round."
        intro="Whether it’s a departure on the list or something we have not planned yet, this is where it starts. Inquiring holds nothing and commits you to nothing."
      />

      <Faq items={planFaq} />
    </>
  );
}

/**
 * The departures as a ledger: a real table from 768px (Journey · Window ·
 * Days · Group · From · Status), stacked rows on a phone. Each title links to
 * its journey.
 */
function Ledger({ journeys }: { journeys: JourneySummary[] }) {
  const status = (journey: JourneySummary) => {
    const tag = journeyTagStatus(journey);
    return <StatusTag status={tag}>{tag === 'open' ? 'Open' : undefined}</StatusTag>;
  };

  return (
    <>
      <table className="hidden w-full border-collapse text-left md:table">
        <caption className="sr-only">Upcoming departures</caption>
        <thead>
          <tr className="border-b border-ink">
            {['Journey', 'Window', 'Days', 'Group', 'From', 'Status'].map((h) => (
              <th key={h} scope="col" className="kicker-sm pb-4 pr-6 font-medium last:pr-0">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {journeys.map((journey) => (
            <tr key={journey.slug} className="group border-b border-line">
              <th scope="row" className="py-6 pr-6 text-left font-normal">
                <Link
                  href={`/journeys/${journey.slug}`}
                  className="h5 transition-colors duration-300 hover:text-brand"
                >
                  {journey.title}
                </Link>
                <span className="kicker-sm mt-1.5 block">{journey.country}</span>
              </th>
              <td className="meta py-6 pr-6 text-body">{journey.departureWindow}</td>
              <td className="meta py-6 pr-6 text-body">{journey.days}</td>
              <td className="meta py-6 pr-6 text-body">Max. {journey.groupMax}</td>
              <td className="meta py-6 pr-6 text-body">
                {journey.priceFrom ? (
                  <>
                    <span className="font-semibold text-ink">{journey.priceFrom}</span> pp
                  </>
                ) : (
                  'To be announced'
                )}
              </td>
              <td className="py-6">{status(journey)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="m-0 list-none border-t border-ink p-0 md:hidden">
        {journeys.map((journey) => (
          <li key={journey.slug} className="border-b border-line py-6">
            <Link href={`/journeys/${journey.slug}`} className="h5 mb-3 block">
              {journey.title}
            </Link>
            <dl className="meta m-0 grid grid-cols-2 gap-x-4 gap-y-3 text-body">
              <div className="col-span-2">
                <dt className="kicker-sm mb-1">Window</dt>
                <dd className="m-0">{journey.departureWindow}</dd>
              </div>
              <div>
                <dt className="kicker-sm mb-1">Days</dt>
                <dd className="m-0">{journey.days}</dd>
              </div>
              <div>
                <dt className="kicker-sm mb-1">Group</dt>
                <dd className="m-0">Max. {journey.groupMax}</dd>
              </div>
              <div>
                <dt className="kicker-sm mb-1">From</dt>
                <dd className="m-0">
                  {journey.priceFrom ? (
                    <>
                      <span className="font-semibold text-ink">{journey.priceFrom}</span> pp
                    </>
                  ) : (
                    'To be announced'
                  )}
                </dd>
              </div>
              <div>
                <dt className="kicker-sm mb-1">Status</dt>
                <dd className="m-0">{status(journey)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </>
  );
}
