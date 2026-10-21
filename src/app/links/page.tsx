import Image from 'next/image';
import Link from 'next/link';
import { Frame } from '@/components/ui/Frame';
import { Arrow } from '@/components/ui/Button';
import { StatusTag } from '@/components/ui/StatusTag';
import { journeyTagStatus } from '@/components/pages/journeyStatus';
import {
  getFeaturedJourneys,
  getJourneySummaries,
  getSiteSettings,
  pageMetadata,
} from '@/lib/content';

export const revalidate = 3600;

/**
 * The Instagram profile link, on our own site instead of Linktree — so the
 * visit, and where it came from, stays with us.
 *
 * Use this as the bio link, tagged so enquiries are credited to Instagram:
 *   https://peaks2shores.com/links?utm_source=instagram&utm_medium=social&utm_campaign=bio
 *
 * Kept out of search: it duplicates pages that rank on their own.
 */
export const metadata = pageMetadata({
  title: 'Links',
  description: 'Peaks2Shores journeys, the journal and how to plan a trip — from Instagram.',
  path: '/links',
  noindex: true,
});

export default async function LinksPage() {
  const [journeys, featured, site] = await Promise.all([
    getJourneySummaries(),
    getFeaturedJourneys(),
    getSiteSettings(),
  ]);
  const lead = featured[0] ?? journeys[0];

  const links = [
    ...journeys.map((journey) => ({
      href: `/journeys/${journey.slug}`,
      title: journey.title,
      meta: `${journey.country} · ${journey.days} days · ${journey.departure}`,
      tag: journeyTagStatus(journey),
    })),
    { href: '/plan', title: 'Plan your journey', meta: 'Enquire, or design a private trip' },
    { href: '/journeys', title: 'All journeys', meta: `Up to ${site.maxGuests} guests each` },
    { href: '/journal', title: 'The journal', meta: 'Places, hotels and tables' },
    { href: '/our-story', title: 'Our story', meta: site.founder.name },
  ];

  return (
    <section className="container-site pb-section-sm pt-block">
      <div className="mx-auto w-full max-w-[520px]">
        <Image
          src="/brand/logo-dark.png"
          alt={site.name}
          width={900}
          height={485}
          sizes="96px"
          className="mb-block h-auto w-24"
        />
        <p className="kicker mb-4">From Instagram</p>
        <h1 className="h3 mb-4">Fewer, better journeys.</h1>
        <p className="prose-body mb-block">
          Small-group journeys of no more than {site.maxGuests} guests, personally curated by{' '}
          {site.founder.name}.
        </p>

        {lead && (
          <Link href={`/journeys/${lead.slug}`} className="group mb-block block">
            <Frame
              media={lead.promoMedia ?? lead.cardMedia}
              ratio="4/5"
              hover
              priority
              decorative
              sizes="(min-width: 560px) 520px, 100vw"
              className="mb-5"
            />
            <span className="kicker-sm mb-2 block">
              {lead.country} · {lead.days} days · {lead.departure}
            </span>
            <span className="h4 block transition-colors duration-300 group-hover:text-acqua-text">
              {lead.title}
            </span>
            <span className="lead mt-1 block">{lead.lead}</span>
          </Link>
        )}

        <ul className="m-0 list-none border-t border-line p-0">
          {links.map((link) => (
            <li key={link.href} className="border-b border-line">
              <Link
                href={link.href}
                className="group flex min-h-16 items-center justify-between gap-6 py-4"
              >
                <span className="min-w-0">
                  <span className="h5 block transition-colors duration-300 group-hover:text-acqua-text">
                    {link.title}
                  </span>
                  <span className="kicker-sm mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {'tag' in link && link.tag && link.tag !== 'open' && (
                      <StatusTag status={link.tag} />
                    )}
                    <span>{link.meta}</span>
                  </span>
                </span>
                <Arrow className="shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
