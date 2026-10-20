import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Itinerary } from '@/components/journeys/Itinerary';
import { EnquiryForm } from '@/components/journeys/EnquiryForm';
import {
  FromMarc,
  Gallery,
  Guests,
  InPreparation,
  JourneyFacts,
  JourneyHero,
  OnPacing,
  Overview,
  Practicalities,
  RelatedJourneys,
  WhereYouStay,
  WhyThisJourney,
} from '@/components/journeys/JourneySections';
import {
  getJourneyBySlug,
  getJourneySlugs,
  getMedia,
  getRelatedJourneys,
  getSiteSettings,
  jsonLd,
  pageMetadata,
  type Journey,
} from '@/lib/content';

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
  return `${journey.lead} ${journey.days} days, ${journey.region}, ${journey.departureWindow}. Maximum ${journey.groupMax} guests.`;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const journey = await getJourneyBySlug(slug);
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

/** What the enquiry block says, by booking state. Never hidden. */
function enquiryCopy(journey: Journey, founder: string) {
  const firstName = founder.split(' ')[0];
  switch (journey.status) {
    case 'sold-out':
    case 'waitlist':
      return {
        kicker: 'Join the waitlist',
        intro: `${journey.title} is ${journey.status === 'sold-out' ? 'full' : 'on a waitlist'}. An enquiry adds your name to the list — it holds nothing and commits you to nothing, and it starts a conversation with ${firstName}.`,
      };
    case 'past':
      return {
        kicker: 'This journey has departed',
        intro: `${journey.title} has already run. If you would like something like it, tell us a little — enquiring holds nothing and commits you to nothing.`,
      };
    default:
      return journey.detail
        ? { kicker: 'Plan your journey', intro: undefined }
        : {
            kicker: 'Register interest',
            intro: `Tell us you are interested in ${journey.title} and who you would travel with. Enquiring holds nothing and commits you to nothing — it starts a conversation with ${firstName}.`,
          };
  }
}

export default async function JourneyPage({ params }: Params) {
  const { slug } = await params;
  const journey = await getJourneyBySlug(slug);
  if (!journey) notFound();

  const [related, site] = await Promise.all([getRelatedJourneys(slug, 2), getSiteSettings()]);

  const url = `${site.url}/journeys/${journey.slug}`;
  const days = journey.detail?.days ?? journey.itinerary ?? [];
  const heroMedia = getMedia(journey.detail?.heroMedia ?? journey.listMedia);
  const price = journey.priceFrom.replace(/[$,]/g, '');

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
      validThrough: journey.departureISO,
    },
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
  const enquiry = enquiryCopy(journey, site.founder.name);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(trip) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }}
      />

      <JourneyHero journey={journey} />
      <JourneyFacts journey={journey} />

      {detail ? (
        <>
          <Overview detail={detail} />
          <WhyThisJourney detail={detail} />
          <Itinerary days={detail.days} headline={detail.itineraryHeadline} />
          <WhereYouStay detail={detail} />
          <OnPacing detail={detail} />
          <Practicalities detail={detail} />
          <FromMarc detail={detail} />
          <Gallery journey={journey} detail={detail} />
          {detail.quotes.length > 0 && <Guests detail={detail} />}
        </>
      ) : (
        <>
          <InPreparation journey={journey} />
          {journey.itinerary && journey.itinerary.length > 0 && (
            <Itinerary
              variant="compact"
              kicker="Day by day · working plan"
              days={journey.itinerary}
              headline={journey.itineraryHeadline ?? 'Day by day.'}
            />
          )}
        </>
      )}

      <RelatedJourneys journeys={related} />

      <EnquiryForm
        journeyTitle={journey.title}
        departure={journey.departureWindow}
        spotsLeft={journey.status && journey.status !== 'open' ? undefined : detail?.spotsLeft}
        groupMax={journey.groupMax}
        kicker={enquiry.kicker}
        intro={enquiry.intro}
      />
    </>
  );
}
