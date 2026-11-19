import type { Metadata } from 'next';
import '@/components/journeys/journey.css';
import { notFound } from 'next/navigation';
import { Itinerary } from '@/components/journeys/Itinerary';
import { JourneyMap } from '@/components/journeys/JourneyMap';
import { JyItinerary } from '@/components/journeys/JourneyItinerary';
import { JourneyTabs, type JourneyTab } from '@/components/journeys/JourneyTabs';
import { JourneyFormsProvider } from '@/components/journeys/forms/JourneyForms';
import {
  FromMarc,
  Gallery,
  Guests,
  InPreparation,
  OnPacing,
  Overview,
  Stays,
  WhyThisJourney,
} from '@/components/journeys/JourneySections';
import {
  departureOptions,
  JyDates,
  JyExtension,
  JyExtensionRow,
  JyHero,
  JyIntro,
} from '@/components/journeys/JourneyEditorial';
import { JyEssentials } from '@/components/journeys/JourneyEssentials';
import { MoreToDiscover } from '@/components/journeys/MoreToDiscover';
import { Stays as HotelStays } from '@/components/journeys/Stays';
import {
  getJourneyBySlug,
  getJourneySlugs,
  getMedia,
  getSiteSettings,
  jsonLd,
  pageMetadata,
  type Journey,
} from '@/lib/content';
import { fromPriceLabel } from '@/lib/journeyPrice';

type Params = { params: Promise<{ slug: string }> };

/*
 * Rebuilt hourly. dynamicParams stays at its default (true): a journey whose
 * publishAt passes after the build is rendered on first request. Before then
 * getJourneyBySlug returns null and the page 404s.
 */
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getJourneySlugs()).map((slug) => ({ slug }));
}

function describe(journey: Journey) {
  return (
    journey.seo?.description ??
    `${journey.lead} ${journey.days} days, ${journey.region}, ${journey.departureWindow}. A small group journey.`
  );
}

/* A journey address that leads nowhere shows the 404 page: it takes that
   page's title and stays out of search, as not-found.tsx does, rather than
   falling back to the homepage's title. */
const notFoundMetadata: Metadata = {
  title: 'Something went off course',
  robots: { index: false, follow: false },
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const journey = await getJourneyBySlug(slug);
  if (!journey) return notFoundMetadata;

  const base = pageMetadata({
    title: journey.seo?.title ?? journey.title,
    description: describe(journey),
    path: `/journeys/${journey.slug}`,
  });
  // Shared in a message or on social, the journey shows its own photograph.
  const hero = getMedia(journey.detail?.heroMedia ?? journey.heroMedia ?? journey.listMedia);
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
  const journey = await getJourneyBySlug(slug);
  if (!journey) notFound();

  const site = await getSiteSettings();

  const url = `${site.url}/journeys/${journey.slug}`;
  const days = journey.detail?.days ?? journey.itinerary ?? [];
  const heroMedia = getMedia(journey.detail?.heroMedia ?? journey.heroMedia ?? journey.listMedia);
  const price = journey.priceFrom?.replace(/[$,]/g, '');
  /* Itinerary steps for structured data: the day by day, or the flyer's stays. */
  const steps = days.length
    ? days.map((day) => ({ position: day.n, name: day.title, description: day.body }))
    : (journey.flyer?.parts.flatMap((p) => p.stays) ?? []).map((stay, i) => ({
        position: i + 1,
        name: stay.place,
        description: `${stay.tagline} ${stay.doing.join(' ')}`,
      }));

  const trip = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    '@id': `${url}#trip`,
    url,
    name: journey.title,
    description: journey.blurb,
    ...(heroMedia.src ? { image: `${site.url}${heroMedia.src}` } : {}),
    ...(journey.who.length ? { touristType: journey.who } : {}),
    ...(journey.departureISO ? { temporalCoverage: journey.departureISO } : {}),
    provider: { '@id': `${site.url}/#organization` },
    ...(steps.length
      ? {
          itinerary: {
            '@type': 'ItemList',
            numberOfItems: steps.length,
            itemListElement: steps.map((step) => ({
              '@type': 'ListItem',
              position: step.position,
              item: {
                '@type': 'TouristAttraction',
                name: step.name,
                description: step.description,
              },
            })),
          },
        }
      : {}),
    // No offer until Marc sets a rate: a priceless Offer is invalid markup.
    ...(price
      ? {
          offers: {
            '@type': 'Offer',
            url,
            priceCurrency: 'USD',
            price,
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: Number(price),
              priceCurrency: 'USD',
              unitText: 'per person',
            },
            availability:
              journey.status === 'past'
                ? 'https://schema.org/Discontinued'
                : journey.status === 'sold-out' || journey.status === 'waitlist'
                  ? 'https://schema.org/SoldOut'
                  : 'https://schema.org/LimitedAvailability',
            ...(journey.departureISO ? { validThrough: journey.departureISO } : {}),
          },
        }
      : {}),
  };

  const breadcrumbs = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
      { '@type': 'ListItem', position: 2, name: 'Journeys', item: `${site.url}/journeys` },
      { '@type': 'ListItem', position: 3, name: journey.title, item: url },
    ],
  };

  const detail = journey.detail;
  const flyer = journey.flyer;

  /* The A&K menu: Overview │ Itinerary │ (extension) │ Stays │ Dates & Rates │
     Essential information. A tab whose section has nothing to show yet is
     left out rather than linking nowhere. The bar's inquiry block carries the
     journey's days, group size and from-price, and "Make an inquiry" (Ishika's
     notes of 9 November 2026, item 17a). */
  const hasStays = flyer
    ? flyer.hotels.length > 0
    : !!detail || !!journey.itinerary?.some((d) => d.stay && d.stay !== '—');
  const tabs: JourneyTab[] = [
    { id: 'overview', label: 'Overview' },
    ...(days.length || flyer ? [{ id: 'itinerary', label: 'Itinerary' }] : []),
    ...(flyer?.extension ? [{ id: 'extension', label: flyer.extension.tab }] : []),
    ...(hasStays ? [{ id: 'stays', label: 'Stays' }] : []),
    { id: 'dates', label: 'Dates & Rates' },
    { id: 'essentials', label: 'Essential information' },
  ];
  const glance = {
    days: `${journey.days} days`,
    group: site.groupSize,
    price: fromPriceLabel(journey),
  };
  const departures = departureOptions(journey);

  /* The page in the order of Ishika's notes of 9 November 2026: hero, menu,
     overview, itinerary, extension (if any), stays, dates and rates,
     essential information, more to discover, footer. The provider holds the
     page's pop-up forms: the inquiry, and the group and private booking
     requests, each already knowing the journey. A journey written before the
     flyers (`detail` or a working day by day) keeps its own sections up to
     its stays; guests' words, where a journey has them, follow the stays. */
  return (
    <JourneyFormsProvider
      journey={{
        slug: journey.slug,
        title: journey.title,
        departures: departures.length ? departures : undefined,
      }}
    >
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(trip) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />

      <JyHero journey={journey} />
      <JourneyTabs tabs={tabs} glance={glance} />

      {flyer ? (
        <>
          <JyIntro journey={journey} flyer={flyer} />
          <JyItinerary journey={journey} flyer={flyer} after={<JyExtensionRow flyer={flyer} />} />
          <JyExtension flyer={flyer} />
          <HotelStays journey={journey} />
        </>
      ) : (
        <div id="overview">
          {detail ? (
            <>
              <Overview detail={detail} />
              <WhyThisJourney detail={detail} />
              <JourneyMap journey={journey} />
              <OnPacing detail={detail} />
              <FromMarc detail={detail} />
              <Gallery journey={journey} detail={detail} />
            </>
          ) : (
            <>
              <InPreparation journey={journey} />
              <JourneyMap journey={journey} />
            </>
          )}
        </div>
      )}

      {flyer ? null : detail ? (
        <Itinerary days={detail.days} headline={detail.itineraryHeadline} />
      ) : (
        journey.itinerary &&
        journey.itinerary.length > 0 && (
          <Itinerary
            variant="compact"
            kicker="Itinerary · working plan"
            days={journey.itinerary}
            headline={journey.itineraryHeadline ?? 'Day by day.'}
          />
        )
      )}
      {!flyer && <Stays journey={journey} />}
      {detail && detail.quotes.length > 0 && <Guests detail={detail} />}
      <JyDates journey={journey} />
      <JyEssentials />
      <MoreToDiscover current={journey} />
    </JourneyFormsProvider>
  );
}
