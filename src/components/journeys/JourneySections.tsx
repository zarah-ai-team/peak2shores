import Link from 'next/link';
import Image from 'next/image';
import { Frame } from '@/components/ui/Frame';
import { Ground } from '@/components/motion/Ground';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { TextReveal } from '@/components/motion/TextReveal';
import { ButtonLink } from '@/components/ui/Button';
import { FactList, MetaItem, SectionLabel, Tick } from '@/components/ui/Editorial';
import { StatusTag } from '@/components/ui/StatusTag';
import { journeyTagStatus } from '@/components/pages/journeyStatus';
import { isNew, type Journey, type JourneyDetail, type JourneySummary } from '@/lib/content';
import { journeyStays } from '@/lib/journeys';
import { enterAt } from '@/lib/motion';
import { site } from '@/lib/site';
import { JourneyCard } from './JourneyCard';

/* -- 1. Hero --------------------------------------------------------------- */

/** The journey at a glance, as the hero's bottom strip shows it. */
function journeyFacts(journey: Journey): { label: string; value: React.ReactNode }[] {
  const tag = journeyTagStatus({ ...journey, isNew: isNew(journey) });
  return [
    { label: 'Days', value: `${journey.days} days · ${journey.days - 1} nights` },
    { label: 'Departure', value: journey.departureWindow },
    { label: 'Group', value: `Max. ${journey.groupMax} guests` },
    { label: 'From', value: `${journey.priceFrom} per person` },
    {
      label: 'Hosted by',
      value: journey.hostedByMarc ? site.founder.name : 'Our team on the ground',
    },
    {
      label: 'Status',
      value: (
        <StatusTag status={tag} tone="dark" className="!text-[0.71875rem]">
          {tag === 'open' ? 'Open' : undefined}
        </StatusTag>
      ),
    },
  ];
}

/**
 * The photograph, full-bleed. Title bottom-left in display type — "Amalfi,
 * Slowly.", the qualifier dropping to a second line — and the journey's
 * one-line lead bottom-right. Along the bottom edge of the photograph, on a
 * band of the hero's own shade, the facts: six columns on one line from a
 * laptop up, label over value, hairlines between; three, then two, columns
 * on smaller screens.
 */
export function JourneyHero({ journey }: { journey: Journey }) {
  const [first, ...rest] = journey.title.split(', ');
  const facts = journeyFacts(journey);

  return (
    <section
      data-hero
      className="relative isolate flex min-h-[42.5rem] flex-col justify-end overflow-hidden md:h-[92svh] md:min-h-[clamp(35rem,38.1vw,45rem)]"
    >
      <div className="absolute inset-0 -z-10">
        <Frame
          media={journey.detail?.heroMedia ?? journey.heroMedia ?? journey.listMedia}
          priority
          reveal={false}
          drift
          sizes="100vw"
          overlay="hero"
          className="h-full"
        />
      </div>
      <div className="container-site grid-site items-end gap-y-6 pb-[clamp(2rem,5vh,3.5rem)] pt-[calc(var(--nav-h)+3rem)] text-on-dark">
        <div className="col-span-4 md:col-span-8 lg:col-span-8">
          <nav aria-label="Breadcrumb" className="enter mb-7" style={enterAt(0.05)}>
            <ol className="kicker m-0 flex list-none flex-wrap items-center gap-x-3.5 gap-y-2 p-0 !text-on-dark">
              <li>
                <Link href="/journeys" className="transition-colors duration-300 hover:text-acqua">
                  Journeys
                </Link>
              </li>
              <li aria-hidden className="opacity-60">
                /
              </li>
              <li aria-current="page">
                {journey.region} · {journey.country}
              </li>
            </ol>
          </nav>
          <TextReveal
            as="h1"
            immediate
            delay={0.15}
            className="page-title max-w-[12ch]"
            lines={
              rest.length
                ? [{ text: `${first},` }, { text: `${rest.join(', ')}.` }]
                : [{ text: journey.title }]
            }
          />
        </div>
        <p
          className="lead enter measure-lead col-span-4 m-0 md:col-span-6 lg:col-span-3 lg:col-start-10 lg:pb-3"
          style={enterAt(0.45)}
        >
          {journey.lead}
        </p>
        {/* From a tablet up the tab bar carries the way to enquire. */}
        <p className="enter col-span-4 m-0 md:hidden" style={enterAt(0.5)}>
          <ButtonLink href="#enquire" variant="light" arrow>
            Inquire
          </ButtonLink>
        </p>
      </div>

      <div
        aria-label="At a glance"
        role="region"
        className="enter border-t border-on-dark/25 bg-[rgb(10_34_50/0.5)] text-on-dark backdrop-blur-[2px]"
        style={enterAt(0.6)}
      >
        <div className="container-site">
          <dl className="journey-facts m-0 grid grid-cols-2 md:grid-cols-3">
            {facts.map((fact) => (
              <div key={fact.label} className="journey-fact">
                <dt className="kicker-sm mb-2.5 !text-on-dark-body">{fact.label}</dt>
                <dd className="h5 journey-fact-value m-0">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

/* -- 2. Overview ---------------------------------------------------------- */

export function Overview({ detail }: { detail: JourneyDetail }) {
  const [first, ...more] = detail.overview;
  return (
    <section aria-labelledby="overview-title" className="py-section">
      <div className="container-site grid-site gap-y-block">
        <div className="col-span-4 md:col-span-8">
          <SectionLabel className="mb-stack">The journey</SectionLabel>
          <Reveal variant="mask">
            <h2 id="overview-title" className="h2 max-w-[20ch]">
              {detail.overviewHeadline}
            </h2>
          </Reveal>
        </div>
        {first && (
          <Reveal className="col-span-4 md:col-span-6 lg:col-span-6 lg:col-start-2">
            <p className="prose-body measure m-0">{first}</p>
          </Reveal>
        )}
        {more.length > 0 && (
          <Reveal
            delay={0.1}
            className="col-span-4 md:col-span-6 md:col-start-3 lg:col-span-4 lg:col-start-8 lg:pt-24"
          >
            {more.map((paragraph) => (
              <p key={paragraph} className="prose-body measure mb-stack">
                {paragraph}
              </p>
            ))}
            <ButtonLink href="#itinerary" variant="rule" arrow>
              Itinerary
            </ButtonLink>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function WhyThisJourney({ detail }: { detail: JourneyDetail }) {
  return (
    <section aria-labelledby="why-title" className="bg-panel py-section-sm">
      <div className="container-site grid-site items-start gap-y-block">
        <Frame
          ratio="4/5"
          media={detail.why.media}
          parallax={30}
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="col-span-4  md:col-span-6 lg:col-span-6"
        />
        <div className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8 lg:pt-block">
          <Reveal>
            <SectionLabel className="mb-stack">Why this journey</SectionLabel>
            <h2 id="why-title" className="h2 mb-block max-w-[22ch]">
              {detail.why.headline}
            </h2>
          </Reveal>
          <RevealGroup as="ol" className="m-0 list-none p-0" stagger={0.06}>
            {detail.why.highlights.map((highlight) => (
              <RevealItem
                as="li"
                key={highlight.n}
                distance={14}
                className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-4 border-t border-line py-6"
              >
                <span aria-hidden className="h5 text-acqua-text">
                  {highlight.n}
                </span>
                <div>
                  <h3 className="h5 mb-1.5">{highlight.title}</h3>
                  <p className="prose-body-sm">{highlight.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

/* -- Stays ----------------------------------------------------------------- */

/**
 * Where you stay, A&K-style: every hotel as a card — photograph, where and
 * for how long, the name, why we chose it, then its signature detail and
 * what is near it. A journey still in preparation lists its stays from the
 * working day by day (place and nights), marked as being confirmed.
 */
export function Stays({ journey }: { journey: Journey }) {
  const detail = journey.detail;
  const planned = detail ? [] : journeyStays(journey);
  if (!detail && planned.length === 0) return null;

  return (
    <section id="stays" aria-labelledby="stays-title" className="bg-panel py-section-sm">
      <div className="container-site">
        <SectionLabel className="mb-stack">Stays</SectionLabel>
        <Reveal variant="mask" className="mb-block">
          <h2 id="stays-title" className="h2 max-w-[22ch]">
            {detail?.hotelsHeadline ?? 'Where you stay, as the plan stands.'}
          </h2>
        </Reveal>

        {detail ? (
          <ul className="m-0 grid list-none gap-x-10 gap-y-16 p-0 md:grid-cols-2">
            {detail.hotels.map((hotel) => (
              <Reveal as="li" key={hotel.name} distance={16}>
                <article aria-labelledby={`stay-${hotel.media}`}>
                  <Frame
                    ratio="3/2"
                    media={hotel.media}
                    sizes="(min-width: 768px) 45vw, 100vw"
                    className="mb-7"
                  />
                  <p className="kicker mb-3">
                    {hotel.place}
                    {hotel.nights && <> · {hotel.nights}</>}
                  </p>
                  <h3 id={`stay-${hotel.media}`} className="h4 mb-4 max-w-[24ch]">
                    {hotel.name}
                  </h3>
                  <p className="prose-body measure mb-6">{hotel.why}</p>
                  <div className="grid gap-6 border-t border-line pt-5 sm:grid-cols-2">
                    <MetaItem label="Signature detail">{hotel.detail}</MetaItem>
                    {hotel.nearby && <MetaItem label="Nearby">{hotel.nearby}</MetaItem>}
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>
        ) : (
          <div className="grid-site gap-y-8">
            <ol className="col-span-4 m-0 list-none border-t border-ink p-0 md:col-span-8 lg:col-span-7">
              {planned.map((stay) => (
                <li
                  key={stay.name}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-5"
                >
                  <span className="h5">{stay.name}</span>
                  <span className="meta whitespace-nowrap text-muted">{stay.nights}</span>
                </li>
              ))}
            </ol>
            <p className="prose-body-sm measure col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
              The hotels themselves are being confirmed. We would rather name them late than name
              them wrong — ask, and we will tell you where things stand.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

/* -- 7. On pacing ---------------------------------------------------------- */

export function OnPacing({ detail }: { detail: JourneyDetail }) {
  const { pacing } = detail;
  return (
    <Ground aria-label="On pacing" className="bg-charcoal pb-section-sm text-on-dark">
      <Frame media={pacing.media} sizes="100vw" className="aspect-[4/3] w-full md:aspect-[16/9]" />
      <div data-tone="dark" className="container-site grid-site gap-y-block pt-section-sm">
        <div className="col-span-4 md:col-span-8 lg:col-span-6">
          <SectionLabel tone="dark" className="mb-stack">
            On pacing
          </SectionLabel>
          <Reveal variant="mask">
            <h2 className="h2 max-w-[18ch]">{pacing.headline}</h2>
          </Reveal>
        </div>
        <Reveal
          delay={0.1}
          className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-7 lg:pt-12"
        >
          <p className="prose-body measure">{pacing.body}</p>
        </Reveal>
        <RevealGroup className="col-span-4 md:col-span-8 lg:col-span-12" stagger={0.1}>
          <dl className="m-0 grid grid-cols-3 border-t border-line-dark">
            {pacing.stats.map((stat, i) => (
              <RevealItem
                key={stat.label}
                variant="scale"
                distance={10}
                className={`flex flex-col-reverse gap-3 pt-7 ${i > 0 ? 'border-l border-line-dark pl-4 md:pl-8' : ''} pr-4`}
              >
                <dt className="kicker-sm">{stat.label}</dt>
                <dd className="numeral m-0">{stat.value}</dd>
              </RevealItem>
            ))}
          </dl>
        </RevealGroup>
      </div>
    </Ground>
  );
}

/* -- Dates & rates --------------------------------------------------------- */

/** How a departure stands for booking, in words. */
function availability(journey: Journey) {
  switch (journey.status) {
    case 'sold-out':
      return 'Sold out · waitlist open';
    case 'waitlist':
      return 'Waitlist';
    case 'past':
      return 'Departed';
    default:
      return journey.detail?.spotsLeft
        ? `${journey.detail.spotsLeft} places left`
        : 'Open for inquiries';
  }
}

/**
 * Dates & Rates, A&K-style: each departure as a row — dates, length, group,
 * the rate and where it stands — with the way to inquire on the row. Below
 * it, what the rate includes and what it does not.
 */
export function DatesAndRates({ journey, cta }: { journey: Journey; cta: string }) {
  const detail = journey.detail;
  const departed = journey.status === 'past';

  return (
    <section id="dates" aria-labelledby="dates-title" className="py-section-sm">
      <div className="container-site">
        <SectionLabel className="mb-stack">Dates &amp; Rates</SectionLabel>
        <Reveal variant="mask" className="mb-block">
          <h2 id="dates-title" className="h2 max-w-[22ch]">
            {departed ? 'This departure has run.' : 'Dates and rates for this journey.'}
          </h2>
        </Reveal>

        <table className="mb-6 w-full border-collapse text-left">
          <thead className="sr-only md:not-sr-only">
            <tr className="border-b border-ink">
              {['Departure', 'Length', 'Group', 'From', 'Availability'].map((h) => (
                <th key={h} scope="col" className="kicker-sm pb-3 pr-6 font-medium text-muted">
                  {h}
                </th>
              ))}
              <th scope="col" className="pb-3">
                <span className="sr-only">Inquire</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-line py-6 md:table-row md:py-0">
              <th scope="row" className="col-span-2 py-0 pr-6 text-left font-normal md:py-6">
                <span className="kicker-sm mb-1.5 block md:hidden">Departure</span>
                <span className="h5">{journey.departureWindow}</span>
              </th>
              <td className="meta py-0 pr-6 text-body md:py-6">
                <span className="kicker-sm mb-1.5 block md:hidden">Length</span>
                {journey.days} days · {journey.days - 1} nights
              </td>
              <td className="meta py-0 pr-6 text-body md:py-6">
                <span className="kicker-sm mb-1.5 block md:hidden">Group</span>
                Max. {journey.groupMax} guests
              </td>
              <td className="meta py-0 pr-6 text-body md:py-6">
                <span className="kicker-sm mb-1.5 block md:hidden">From</span>
                <span className="font-semibold text-ink">{journey.priceFrom}</span> per person
              </td>
              <td className="meta py-0 pr-6 md:py-6">
                <span className="kicker-sm mb-1.5 block md:hidden">Availability</span>
                <StatusTag status={journeyTagStatus(journey)}>{availability(journey)}</StatusTag>
              </td>
              <td className="col-span-2 py-0 md:py-6 md:text-right">
                <ButtonLink href="#enquire" variant="rule" arrow>
                  {cta}
                </ButtonLink>
              </td>
            </tr>
          </tbody>
        </table>
        <p className="prose-body-sm measure mb-section-sm text-muted">
          Rates are per person, in US dollars. The same journey can be arranged privately on your
          own dates —{' '}
          <Link href="/plan#private" className="underline underline-offset-4 hover:text-ink">
            ask about private travel
          </Link>
          .
        </p>

        {detail ? (
          <div className="grid-site gap-y-block">
            <Reveal className="col-span-4 md:col-span-8 lg:col-span-7">
              <h3 className="h3 mb-block">What’s included</h3>
              <FactList
                labelWidth={200}
                rows={detail.included.map((item) => ({ label: item.label, value: item.value }))}
              />
            </Reveal>
            <Reveal
              delay={0.1}
              className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:pt-[calc(var(--spacing-block)+3.5rem)]"
            >
              <h3 className="kicker mb-4">Not included</h3>
              <p className="prose-body-sm measure mb-stack">{notIncluded(detail.notIncluded)}</p>
              <ButtonLink href="/booking-terms" variant="rule" arrow>
                Booking terms
              </ButtonLink>
            </Reveal>
          </div>
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-10 gap-y-4 border-t border-line pt-6">
            <p className="prose-body-sm measure m-0">
              What the rate includes is confirmed with the full write-up of the journey.
            </p>
            <ButtonLink href="/booking-terms" variant="rule" arrow>
              Booking terms
            </ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}

/** "Not included: x, y." → "X, y." — it sits under its own label. */
function notIncluded(text: string) {
  const rest = text.replace(/^Not included:\s*/, '');
  return rest.charAt(0).toUpperCase() + rest.slice(1);
}

/* -- 9. From Marc ---------------------------------------------------------- */

export function FromMarc({ detail }: { detail: JourneyDetail }) {
  return (
    <section aria-labelledby="marc-title" className="bg-stone py-section-sm">
      <div data-tone="stone" className="container-site grid-site gap-y-block">
        <Reveal className="col-span-4 md:col-span-8 lg:col-span-8">
          <SectionLabel
            as="h2"
            id="marc-title"
            tone="stone"
            className="mb-block flex items-center gap-3.5"
          >
            <Tick />
            From Marc
          </SectionLabel>
          <blockquote className="quote m-0 max-w-[30ch]">“{detail.marc.quote}”</blockquote>
        </Reveal>
        <Reveal
          delay={0.12}
          className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:self-end"
        >
          <div className="mb-stack flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-end justify-center overflow-hidden rounded-full bg-white">
              <Image
                src="/brand/marc.webp"
                alt={`${site.founder.name}, founder of ${site.name}`}
                width={1150}
                height={1400}
                sizes="56px"
                className="mb-[-0.5rem] h-auto w-14"
              />
            </div>
            <p className="m-0">
              <span className="h5 block">{site.founder.name}</span>
              <span className="kicker-sm">{detail.marc.role}</span>
            </p>
          </div>
          <p className="prose-body measure">{detail.marc.note}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* -- 10. Gallery ----------------------------------------------------------- */

export function Gallery({ journey, detail }: { journey: Journey; detail: JourneyDetail }) {
  return (
    <section aria-label={`${journey.title} in pictures`} className="py-section-sm">
      <div className="container-site">
        <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 lg:grid-cols-12">
          {detail.gallery.map((item) => {
            const wide = item.span === 'wide';
            const ratio = wide
              ? item.height === 'tall'
                ? 'aspect-[16/10]'
                : 'aspect-[16/9]'
              : item.height === 'tall'
                ? 'aspect-[4/5]'
                : 'aspect-square';
            return (
              <li key={item.media} className={wide ? 'col-span-2 lg:col-span-8' : 'lg:col-span-4'}>
                <Frame
                  media={item.media}
                  sizes={
                    wide ? '(min-width: 1024px) 66vw, 100vw' : '(min-width: 1024px) 33vw, 50vw'
                  }
                  className={`${ratio} ${!wide && item.height === 'tall' ? 'lg:aspect-auto lg:h-full' : ''}`}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* -- 11. Guests (verified quotes only) ------------------------------------- */

export function Guests({ detail }: { detail: JourneyDetail }) {
  // The provider strips unverified quotes; this guards the template too.
  const quotes = detail.quotes.filter((q) => q.verified === true);
  if (quotes.length === 0) return null;
  return (
    <section aria-labelledby="guests-title" className="pb-section-sm">
      <div className="container-site">
        <div className="rule grid-site gap-y-block pt-section-sm">
          <SectionLabel
            as="h2"
            id="guests-title"
            className="col-span-4 md:col-span-8 lg:col-span-12"
          >
            Guests
          </SectionLabel>
          {quotes.map((quote) => (
            <figure key={quote.who} className="col-span-4 m-0 md:col-span-4 lg:col-span-6">
              <blockquote className="quote m-0 mb-stack">“{quote.text}”</blockquote>
              <figcaption className="kicker-sm">{quote.who}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -- In preparation -------------------------------------------------------- */

export function InPreparation({ journey }: { journey: Journey }) {
  const hasDays = !!journey.itinerary?.length;

  return (
    <section aria-labelledby="prep-title" className="py-section">
      <div className="container-site grid-site gap-y-block">
        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          <Reveal>
            <SectionLabel className="mb-stack flex items-center gap-3.5 !text-acqua-text">
              <Tick />
              In preparation
            </SectionLabel>
          </Reveal>
          <Reveal variant="mask">
            <h2 id="prep-title" className="h2 mb-stack max-w-[20ch]">
              {journey.lead}
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="prose-body measure m-0">{journey.blurb}</p>
          </Reveal>
        </div>

        <Reveal
          delay={0.15}
          className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:pt-12"
        >
          <div className="border-t border-line pt-6">
            {hasDays ? (
              <>
                <p className="kicker mb-4">Day by day · working plan</p>
                <p className="prose-body measure mb-4">
                  The day-by-day below is the plan as it stands. The hotels, the tables and the
                  people on the ground are being confirmed; we would rather publish those late than
                  publish them wrong.
                </p>
                <p className="prose-body measure mb-stack">
                  Ask and we will send the full write-up as soon as it is signed off — usually
                  within a few days.
                </p>
                <div className="flex flex-wrap gap-x-8">
                  <ButtonLink href="#itinerary" variant="rule" arrow>
                    Itinerary
                  </ButtonLink>
                  <ButtonLink href="#enquire" variant="rule">
                    Register interest
                  </ButtonLink>
                </div>
              </>
            ) : (
              <>
                <p className="kicker mb-4">Day by day · in preparation</p>
                <p className="prose-body measure mb-4">
                  The written itinerary for this journey is still being finalized with our people on
                  the ground. We would rather publish it late than publish it wrong.
                </p>
                <p className="prose-body measure mb-stack">
                  Ask for it and we will send the day-by-day as soon as it is signed off — usually
                  within a few days.
                </p>
                <ButtonLink href="#enquire" variant="rule" arrow>
                  Request the itinerary
                </ButtonLink>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* -- You may also like ----------------------------------------------------- */

export function RelatedJourneys({ journeys }: { journeys: JourneySummary[] }) {
  if (journeys.length === 0) return null;
  return (
    <section aria-labelledby="related-title" className="pb-section-sm">
      <div className="container-site">
        <div className="rule flex flex-wrap items-end justify-between gap-6 pt-section-sm">
          <h2 id="related-title" className="h2">
            You may also like
          </h2>
          <ButtonLink href="/journeys" variant="rule" arrow>
            All journeys
          </ButtonLink>
        </div>
        {/* The card frame, not the list frame: each journey's own page and the
            Journeys index open on other photographs. */}
        <ul className="m-0 mt-block grid list-none gap-x-8 gap-y-16 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {journeys.map((journey) => (
            <li key={journey.slug}>
              <JourneyCard journey={journey} media={journey.cardMedia} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
