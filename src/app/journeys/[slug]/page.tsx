import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { TextReveal } from '@/components/motion/TextReveal';
import { ButtonLink } from '@/components/ui/Button';
import { FactList, MetaItem, SectionLabel } from '@/components/ui/Editorial';
import { Itinerary } from '@/components/journeys/Itinerary';
import { EnquiryForm } from '@/components/journeys/EnquiryForm';
import { getJourney, journeyLabel, liveJourneys, type Journey } from '@/lib/journeys';
import { getMedia } from '@/lib/media';
import { enterAt } from '@/lib/motion';
import { jsonLd, pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

type Params = { params: Promise<{ slug: string }> };

export const revalidate = 3600;

export function generateStaticParams() {
  return liveJourneys().map((journey) => ({ slug: journey.slug }));
}

function describe(journey: Journey) {
  return `${journey.lead} ${journey.days} days, ${journey.region}, ${journey.departureWindow}. Maximum ${journey.groupMax} guests.`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const journey = getJourney(slug);
  if (!journey) return {};

  const base = pageMetadata({
    title: journey.title,
    description: describe(journey),
    path: `/journeys/${journey.slug}`,
  });
  // Shared in a message or on social, the journey shows its own photograph.
  const hero = getMedia(journey.detail?.heroMedia ?? journey.listMedia);
  if (!hero.src) return base;
  const images = [{ url: hero.src, alt: hero.alt ?? journey.title }];
  return {
    ...base,
    openGraph: { ...base.openGraph, images },
    twitter: { ...base.twitter, images },
  };
}

export default async function JourneyPage({ params }: Params) {
  const { slug } = await params;
  const journey = getJourney(slug);
  if (!journey) notFound();

  const url = `${site.url}/journeys/${journey.slug}`;
  const days = journey.detail?.days ?? journey.itinerary ?? [];
  const heroMedia = getMedia(journey.detail?.heroMedia ?? journey.listMedia);

  const trip = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': `${url}#trip`,
    url,
    name: journey.title,
    description: journey.blurb,
    ...(heroMedia.src ? { image: `${site.url}${heroMedia.src}` } : {}),
    touristType: journey.who,
    temporalCoverage: journey.departureISO,
    provider: { '@id': `${site.url}/#organization` },
    ...(days.length
      ? {
          itinerary: {
            '@type': 'ItemList',
            numberOfItems: days.length,
            itemListElement: days.map((day) => ({
              '@type': 'ListItem',
              position: day.n,
              item: {
                '@type': 'TouristAttraction',
                name: day.title,
                description: day.body,
              },
            })),
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'USD',
      price: journey.priceFrom.replace(/[$,]/g, ''),
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: Number(journey.priceFrom.replace(/[$,]/g, '')),
        priceCurrency: 'USD',
        unitText: 'per person',
      },
      availability:
        journey.status && journey.status !== 'open'
          ? 'https://schema.org/SoldOut'
          : 'https://schema.org/LimitedAvailability',
      validThrough: journey.departureISO,
    },
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Journeys', item: `${site.url}/journeys` },
      { '@type': 'ListItem', position: 2, name: journey.title, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(trip) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />

      <JourneyHero journey={journey} />
      <Facts journey={journey} />

      {journey.detail ? (
        <JourneyDetailSections journey={journey} detail={journey.detail} />
      ) : (
        <InPreparation journey={journey} />
      )}

      <EnquiryForm
        journeyTitle={journey.title}
        departure={journey.departureWindow}
        spotsLeft={journey.detail?.spotsLeft}
        groupMax={journey.groupMax}
      />
    </>
  );
}

/* -- Hero ---------------------------------------------------------------- */

function JourneyHero({ journey }: { journey: Journey }) {
  const [first, ...rest] = journey.title.split(', ');

  return (
    <section
      data-hero
      className="relative isolate flex min-h-[560px] flex-col justify-end overflow-hidden md:h-[92svh] md:min-h-[720px]"
    >
      <div className="absolute inset-0 -z-10">
        <Frame
          media={journey.detail?.heroMedia ?? journey.listMedia}
          priority
          reveal={false}
          drift
          decorative
          sizes="100vw"
          overlay="hero"
          className="h-full"
        />
      </div>
      <div className="gutter pb-14 pt-[140px] text-white md:pb-16">
        <nav aria-label="Breadcrumb" className="enter mb-7" style={enterAt(0.05)}>
          <ol className="kicker m-0 flex list-none flex-wrap items-center gap-3.5 p-0 text-white">
            <li>
              <Link href="/journeys" className="transition-colors duration-300 hover:text-acqua">
                Journeys
              </Link>
            </li>
            <li aria-hidden className="opacity-60">
              /
            </li>
            <li aria-current="page">
              {journeyLabel(journey) && (
                <span className="text-acqua">{journeyLabel(journey)} · </span>
              )}
              {journey.country} · {journey.region}
            </li>
          </ol>
        </nav>
        <TextReveal
          as="h1"
          immediate
          delay={0.15}
          className="display"
          // The canvas sets journey heroes as "Amalfi, *Slowly.*" — the
          // qualifier drops to a second line in italic, closed with a full stop.
          lines={
            rest.length
              ? [{ text: `${first},` }, { text: `${rest.join(', ')}.`, italic: true }]
              : [{ text: journey.title }]
          }
        />
      </div>
    </section>
  );
}

/* -- Facts rule ---------------------------------------------------------- */

function Facts({ journey }: { journey: Journey }) {
  const facts = [
    { label: 'Destination', value: `${journey.region}, ${journey.country}` },
    { label: 'Duration', value: `${journey.days} days · ${journey.days - 1} nights` },
    { label: 'Group', value: `Max. ${journey.groupMax} guests` },
    { label: 'Departure', value: journey.departureWindow },
    { label: 'From', value: `${journey.priceFrom} per person` },
    {
      label: 'Hosted by',
      value: journey.hostedByMarc ? site.founder.name : 'Our team on the ground',
    },
  ];

  return (
    <RevealGroup
      as="section"
      aria-label="At a glance"
      className="gutter border-b border-line"
      stagger={0.06}
      amount={0.3}
    >
      <dl className="m-0 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {facts.map((fact) => (
          <RevealItem
            key={fact.label}
            distance={12}
            className="border-line py-7 pr-6 lg:mr-6 lg:border-r"
          >
            <dt className="kicker-sm mb-3">{fact.label}</dt>
            <dd className="m-0 font-ui text-[15px] leading-[1.4] lg:text-[16px]">{fact.value}</dd>
          </RevealItem>
        ))}
      </dl>
    </RevealGroup>
  );
}

/* -- The written journey ------------------------------------------------- */

function JourneyDetailSections({
  journey,
  detail,
}: {
  journey: Journey;
  detail: NonNullable<Journey['detail']>;
}) {
  return (
    <>
      <section className="gutter editorial-grid border-b border-line pb-20 pt-20 md:pb-[104px] md:pt-[112px]">
        <SectionLabel className="lg:pt-4">The journey</SectionLabel>
        <Reveal variant="mask">
          <h2 className="h2">{detail.overviewHeadline}</h2>
        </Reveal>
        <Reveal delay={0.12} className="max-w-[460px] lg:pt-4">
          {detail.overview.map((paragraph) => (
            <p key={paragraph} className="prose-body mb-5">
              {paragraph}
            </p>
          ))}
          <div className="mt-3 flex flex-wrap items-center gap-7">
            <ButtonLink href="#enquire" variant="ink">
              Enquire
            </ButtonLink>
            <ButtonLink href="#days" variant="rule">
              Day by day
            </ButtonLink>
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="why-title" className="grid border-b border-line lg:grid-cols-2">
        <Frame
          media={detail.why.media}
          parallax={36}
          decorative
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="min-h-[340px] sm:min-h-[480px] lg:min-h-[820px]"
        />
        <div className="gutter flex flex-col gap-10 py-20 lg:py-[100px] lg:pr-24">
          <Reveal direction="left" distance={24}>
            <SectionLabel className="mb-7">Why this journey</SectionLabel>
            <h2 id="why-title" className="h4 max-w-[520px]">
              {detail.why.headline}
            </h2>
          </Reveal>
          <RevealGroup as="ul" className="m-0 flex list-none flex-col border-t border-line p-0">
            {detail.why.highlights.map((highlight) => (
              <RevealItem
                as="li"
                key={highlight.n}
                distance={14}
                className="grid grid-cols-[48px_minmax(0,1fr)] gap-5 border-b border-line py-5"
              >
                <span className="font-ui text-[11px] leading-[1.6] tracking-[0.2em] text-muted">
                  {highlight.n}
                </span>
                <div>
                  <h3 className="mb-1.5 font-display text-[20px] leading-[1.3]">
                    {highlight.title}
                  </h3>
                  <p className="prose-body-sm">{highlight.body}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <Itinerary days={detail.days} headline={detail.itineraryHeadline} />

      <section
        aria-labelledby="hotels-title"
        className="gutter border-b border-line bg-panel pb-20 pt-20 md:pb-[104px] md:pt-[112px]"
      >
        <div className="editorial-grid--wide mb-14 lg:mb-[72px]">
          <SectionLabel className="lg:pt-3">Where you stay</SectionLabel>
          <Reveal variant="mask">
            <h2 id="hotels-title" className="h3 max-w-[760px]">
              {detail.hotelsHeadline}
            </h2>
          </Reveal>
        </div>
        <div className="grid gap-14 lg:grid-cols-2">
          {detail.hotels.map((hotel, i) => (
            <Reveal as="article" key={hotel.name} delay={i * 0.1}>
              <Frame
                media={hotel.media}
                decorative
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-[320px] sm:h-[440px] lg:h-[520px]"
              />
              <div className="flex flex-col gap-4 pt-7">
                <div className="kicker-sm flex justify-between gap-4">
                  <span>{hotel.place}</span>
                  <span>{hotel.nights}</span>
                </div>
                <h3 className="h4">{hotel.name}</h3>
                <p className="prose-body max-w-[520px] text-[15px]">{hotel.why}</p>
                <p className="border-t border-line pt-4 font-ui text-[13px] font-light leading-[1.6] text-body">
                  <span className="kicker-sm mr-3">Signature detail</span>
                  {hotel.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="pacing-title" className="grid border-b border-line lg:grid-cols-2">
        <Frame
          media={detail.pacing.media}
          parallax={36}
          decorative
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="min-h-[300px] sm:min-h-[440px] lg:min-h-[720px]"
        />
        <div className="gutter flex flex-col justify-center gap-7 py-20 lg:py-[100px] lg:pr-24">
          <Reveal direction="left" distance={24} className="flex flex-col gap-7">
            <SectionLabel>On pacing</SectionLabel>
            <h2 id="pacing-title" className="h4 max-w-[520px]">
              {detail.pacing.headline}
            </h2>
            <p className="prose-body max-w-[460px] text-[15px]">{detail.pacing.body}</p>
          </Reveal>
          <RevealGroup
            className="grid max-w-[520px] grid-cols-3 border-t border-line"
            stagger={0.1}
            delay={0.15}
          >
            {detail.pacing.stats.map((stat, i) => (
              <RevealItem
                key={stat.label}
                variant="scale"
                distance={10}
                className={`pr-5 pt-5 ${i < 2 ? 'border-r border-line' : ''} ${i > 0 ? 'pl-5' : ''}`}
              >
                <div className="mb-2 font-display text-[36px] leading-none">{stat.value}</div>
                <div className="font-ui text-[10px] uppercase leading-[1.5] tracking-[0.16em] text-muted">
                  {stat.label}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="gutter grid gap-14 border-b border-line pb-20 pt-20 md:pb-[104px] md:pt-[112px] lg:grid-cols-2 lg:gap-24">
        <Reveal aria-labelledby="included-title">
          <SectionLabel as="h2" id="included-title" className="mb-7">
            What’s included
          </SectionLabel>
          <FactList
            labelWidth={200}
            rows={detail.included.map((item) => ({ label: item.label, value: item.value }))}
          />
          <p className="mt-5 max-w-[460px] font-ui text-[12px] font-light leading-[1.6] text-muted">
            {detail.notIncluded}
          </p>
        </Reveal>

        <Reveal delay={0.12} className="flex flex-col gap-7">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 shrink-0 items-end justify-center overflow-hidden"
              /* The one circle in the system — a portrait crop, not a card. */
              style={{ backgroundColor: 'var(--color-tone-sand)', borderRadius: '50%' }}
            >
              <Image
                src="/brand/marc.webp"
                alt=""
                width={1150}
                height={1400}
                sizes="56px"
                className="mb-[-8px] h-auto w-14"
              />
            </div>
            <div>
              <SectionLabel as="h2" className="mb-2">
                Marc’s perspective
              </SectionLabel>
              <p className="lead m-0 text-[16px] leading-[1.3]">{detail.marc.role}</p>
            </div>
          </div>
          <blockquote className="m-0 border-l border-gorse pl-7 font-display text-[clamp(22px,2.2vw,28px)] leading-[1.35] tracking-[-0.01em]">
            “{detail.marc.quote}”
          </blockquote>
          <p className="prose-body max-w-[460px] text-[15px]">{detail.marc.note}</p>
        </Reveal>
      </section>

      <section
        aria-label={`${journey.title} gallery`}
        className="grid gap-0.5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {detail.gallery.map((item) => (
          <Frame
            key={item.media}
            media={item.media}
            sizes={
              item.span === 'wide'
                ? '(min-width: 1024px) 66vw, (min-width: 640px) 50vw, 100vw'
                : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
            }
            className={`${item.height === 'tall' ? 'h-[320px] lg:h-[520px]' : 'h-[280px] lg:h-[440px]'} ${
              item.span === 'wide' ? 'lg:col-span-2' : ''
            }`}
          />
        ))}
      </section>

      <section
        aria-labelledby="guests-title"
        className="gutter editorial-grid border-b border-line pb-20 pt-20 md:pb-[104px] md:pt-[112px]"
      >
        <SectionLabel as="h2" id="guests-title" className="lg:pt-3">
          Guests
        </SectionLabel>
        {detail.quotes.map((quote, i) => (
          <Reveal key={quote.who} delay={i * 0.12}>
            <figure className="m-0">
              <blockquote className="lead m-0 mb-6 max-w-[480px] text-[26px]">
                “{quote.text}”
              </blockquote>
              <figcaption className="kicker">{quote.who}</figcaption>
            </figure>
          </Reveal>
        ))}
      </section>
    </>
  );
}

/* -- Journeys whose itinerary is not yet written ------------------------- */

function InPreparation({ journey }: { journey: Journey }) {
  const days = journey.itinerary;
  const hasDays = !!days?.length;

  return (
    <>
      <section className="gutter editorial-grid border-b border-line pb-20 pt-20 md:pb-[104px] md:pt-[112px]">
        <SectionLabel className="lg:pt-4">The journey</SectionLabel>

        <div>
          <Reveal variant="mask" className="mb-7">
            <h2 className="h2">{journey.lead}</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="prose-body max-w-[520px]">{journey.blurb}</p>
            <div className="mt-8 grid max-w-[520px] grid-cols-2 gap-6 border-t border-line pt-5 sm:grid-cols-4">
              <MetaItem label="Duration">{journey.days} days</MetaItem>
              <MetaItem label="Departure">{journey.departure}</MetaItem>
              <MetaItem label="Group">{journey.group}</MetaItem>
              <MetaItem label="From">{journey.priceFrom} pp</MetaItem>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="lg:pt-4">
          <div className="border-t border-line pt-6">
            {hasDays ? (
              <>
                <div className="kicker mb-4">Day by day · working plan</div>
                <p className="prose-body max-w-[440px]">
                  The day-by-day below is the plan as it stands. The hotels, the tables and the
                  people on the ground are being confirmed; we would rather publish those late than
                  publish them wrong.
                </p>
                <p className="prose-body mb-7 max-w-[440px]">
                  Ask and we will send the full write-up as soon as it is signed off — usually
                  within a few days.
                </p>
                <ButtonLink href="#days" variant="rule">
                  Day by day
                </ButtonLink>
              </>
            ) : (
              <>
                <div className="kicker mb-4">Day by day · in preparation</div>
                <p className="prose-body max-w-[440px]">
                  The written itinerary for this journey is still being finalised with our people on
                  the ground. We would rather publish it late than publish it wrong.
                </p>
                <p className="prose-body mb-7 max-w-[440px]">
                  Ask for it and we will send the day-by-day as soon as it is signed off — usually
                  within a few days.
                </p>
                <ButtonLink href="#enquire" variant="rule">
                  Request the itinerary
                </ButtonLink>
              </>
            )}
          </div>
        </Reveal>
      </section>

      {days && hasDays && (
        <Itinerary days={days} headline={journey.itineraryHeadline ?? 'Day by day.'} />
      )}
    </>
  );
}
