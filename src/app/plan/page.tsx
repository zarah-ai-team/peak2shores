import Link from 'next/link';
import { Faq } from '@/components/ui/Faq';
import { andList, site } from '@/lib/site';
import { planFaq } from '@/lib/data/faq';
import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { FactList, SectionLabel, Tick } from '@/components/ui/Editorial';
import { Section } from '@/components/ui/Section';
import { StatusTag } from '@/components/ui/StatusTag';
import { EnquiryForm, type EnquiryJourney } from '@/components/journeys/EnquiryForm';
import { fromPriceLabel } from '@/lib/journeyPrice';
import {
  getDestinations,
  getEnquirableJourneyTitles,
  getJourneySummaries,
  getMedia,
  pageMetadata,
  type JourneySummary,
} from '@/lib/content';

/* Rebuilt hourly, so a journey scheduled with `publishAt` appears on time
   (while the page reads the address, below, it is drawn for each visit). */
export const revalidate = 3600;

export const metadata = pageMetadata({
  title: 'Plan your journey',
  description:
    'Start with a conversation, not a form. Join a departure, or design a private journey on your own dates with the same hotels and the same people on the ground.',
  path: '/plan',
});

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ travel?: string | string[]; journey?: string | string[] }>;
}) {
  /* The way the address asks for (every private-travel link is
     /plan?travel=private#contact, a journey's /plan?journey=…#contact), read
     here so the form's first paint already shows it. Reading the address
     renders the page for each visit, which also keeps a journey scheduled
     with `publishAt` on time. */
  const { travel, journey } = await searchParams;
  const one = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  const [journeys, titles, destinations] = await Promise.all([
    getJourneySummaries(),
    getEnquirableJourneyTitles(),
    getDestinations(),
  ]);

  /* The journeys a visitor can join, as the form's photograph cards: every
     one the inquiry API accepts, with its length and route. */
  const cards: EnquiryJourney[] = journeys
    .filter((j) => titles.includes(j.title) && j.status !== 'past')
    .map((j) => {
      const m = getMedia(j.cardMedia);
      return {
        slug: j.slug,
        title: j.title,
        line: `${j.days} days · ${j.region}`,
        img: m.src,
        alt: m.alt,
      };
    });
  const marc = getMedia('marc-portrait');

  return (
    <>
      <EnquiryForm
        journeys={cards}
        destinations={destinations.map((d) => d.country)}
        portrait={marc.src ? { src: marc.src, alt: marc.alt ?? 'Marc Haeni' } : undefined}
        initialPath={one(travel) === 'private' ? 'private' : 'departure'}
        initialJourney={one(journey)}
      />

      <Section pad="section-sm" aria-labelledby="departures-title">
        <div className="mb-block flex flex-wrap items-end justify-between gap-6">
          <div>
            <SectionLabel className="mb-stack">Upcoming departures</SectionLabel>
            <Reveal variant="mask">
              <h2 id="departures-title" className="h2 max-w-[24ch]">
                Or join a small group on one of our departures.
              </h2>
            </Reveal>
          </div>
        </div>
        <Ledger journeys={journeys.filter((journey) => journey.status !== 'past')} />
      </Section>

      <Section ground="stone" pad="section-sm" id="private" aria-labelledby="private-title">
        <div className="grid-site items-center gap-y-block">
          <Frame
            media="plan-private"
            ratio="4/5"
            sizes="(min-width: 1024px) 45vw, (min-width: 768px) 36vw, (orientation: landscape) calc((100vh - 6.25rem) * 0.8), 100vw"
            className="col-span-4 md:col-span-3 lg:col-span-5 max-md:landscape:col-span-2 max-md:landscape:self-start max-lg:landscape:max-h-[calc(100svh-var(--nav-h)-2rem)]"
          />
          <Reveal className="col-span-4 md:col-span-5 lg:col-span-6 lg:col-start-7 max-md:landscape:col-span-2">
            <SectionLabel tone="stone" className="mb-stack flex items-center gap-3.5">
              <Tick />
              Bespoke Private Travel
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
                { label: 'Group size', value: 'Just your party' },
                { label: 'Where', value: andList.format(destinations.map((d) => d.country)) },
                { label: 'Lead time', value: 'Six months is comfortable; less is often possible' },
              ]}
            />
          </Reveal>
        </div>
      </Section>

      <Faq items={planFaq} className="pt-section-sm" />
    </>
  );
}

/**
 * To a finger, a journey's title is a 44px target however short it is: an
 * invisible band centred on it, as on the inquiry form's Privacy Policy link.
 */
const TITLE_TARGET =
  'relative pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:top-1/2 pointer-coarse:after:h-11 pointer-coarse:after:-translate-y-1/2';

/**
 * The departures as a ledger: a real table from 768px (Journey · Window ·
 * Days · Group · Price · Status), stacked rows on a phone. Each title links to
 * its journey. The group is its size, "10–18 guests"; the price is the
 * journey's from-price line, "From $X per person" or "Rates to be announced"
 * (fromPriceLabel); the status is Marc's (his review of 23 November 2026),
 * the best of its departures, drawn as on its page: "Booking Now".
 */
function Ledger({ journeys }: { journeys: JourneySummary[] }) {
  const status = (journey: JourneySummary) => (
    <StatusTag status={journey.availability.status} limited={journey.availability.limited} />
  );

  return (
    <>
      <table className="hidden w-full border-collapse text-left md:table">
        <caption className="sr-only">Upcoming departures</caption>
        <thead>
          <tr className="border-b border-ink">
            {['Journey', 'Window', 'Days', 'Group', 'Price', 'Status'].map((h) => (
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
                {/* One box to a finger, a title on two lines included. */}
                <Link
                  href={`/journeys/${journey.slug}`}
                  className={`h5 transition-colors duration-300 hover:text-brand-deep pointer-coarse:block ${TITLE_TARGET}`}
                >
                  {journey.title}
                </Link>
                <span className="kicker-sm mt-1.5 block">{journey.country}</span>
              </th>
              <td className="meta py-6 pr-6 text-body">{journey.departureWindow}</td>
              <td className="meta py-6 pr-6 text-body">{journey.days}</td>
              <td className="meta py-6 pr-6 text-body">{site.groupSize}</td>
              <td className="meta py-6 pr-6 text-body">{fromPriceLabel(journey)}</td>
              <td className="py-6">{status(journey)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="m-0 list-none border-t border-ink p-0 md:hidden">
        {journeys.map((journey) => (
          <li key={journey.slug} className="border-b border-line py-6">
            <Link href={`/journeys/${journey.slug}`} className={`h5 mb-3 block ${TITLE_TARGET}`}>
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
                <dd className="m-0">{site.groupSize}</dd>
              </div>
              <div>
                <dt className="kicker-sm mb-1">Price</dt>
                <dd className="m-0">{fromPriceLabel(journey)}</dd>
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
