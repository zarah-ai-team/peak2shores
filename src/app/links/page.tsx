import Link from 'next/link';
import { PageTitle } from '@/components/ui/Editorial';
import { journeyLabel, liveJourneys, toSummary } from '@/lib/journeys';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

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
export const metadata = {
  ...pageMetadata({
    title: 'Links',
    description: `${site.name} journeys, the journal and how to plan a trip — from Instagram.`,
    path: '/links',
  }),
  robots: { index: false, follow: true },
};

export default function LinksPage() {
  const journeys = liveJourneys().map(toSummary);

  const links = [
    ...journeys.map((journey) => ({
      href: `/journeys/${journey.slug}`,
      title: journey.title,
      meta: [journeyLabel(journey), journey.country, `${journey.days} days`, journey.departure]
        .filter(Boolean)
        .join(' · '),
    })),
    { href: '/plan', title: 'Plan your journey', meta: 'Enquire, or design a private trip' },
    { href: '/journeys', title: 'All journeys', meta: `Up to ${site.maxGuests} guests each` },
    { href: '/journal', title: 'The journal', meta: 'Places, hotels and tables' },
    { href: '/our-story', title: 'Our story', meta: site.founder.name },
  ];

  return (
    <>
      <PageTitle kicker="From Instagram" title="Fewer, better journeys.">
        Small-group journeys of no more than {site.maxGuests} guests, personally curated by{' '}
        {site.founder.name}.
      </PageTitle>

      <section className="gutter pb-24 md:pb-[104px]">
        <ul className="m-0 flex max-w-[820px] list-none flex-col border-t border-line p-0">
          {links.map((link) => (
            <li key={link.href} className="border-b border-line">
              <Link
                href={link.href}
                className="group grid gap-2 py-6 transition-colors duration-300 hover:bg-panel sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline sm:gap-8"
              >
                <span className="font-display text-[clamp(22px,2.2vw,30px)] leading-[1.2] transition-colors duration-300 group-hover:text-acqua-text">
                  {link.title}
                </span>
                <span className="kicker-sm sm:text-right">{link.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
