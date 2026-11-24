import { Fragment } from 'react';
import Link from 'next/link';
import { Frame } from '@/components/ui/Frame';
import { Arrow } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/Editorial';
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
      meta: [journey.country, `${journey.days} days`, journey.departure],
      tag: journeyTagStatus(journey),
    })),
    { href: '/plan', title: 'Plan your journey', meta: ['Enquire, or design a private trip'] },
    { href: '/journeys', title: 'All journeys', meta: ['Small groups, personally curated'] },
    { href: '/journal', title: 'The journal', meta: ['Places, hotels and tables'] },
    { href: '/our-story', title: 'Our story', meta: [site.founder.name] },
  ];

  return (
    <section className="container-site pb-section-sm pt-block">
      {/* No logo of its own: the site header above already carries it, and
          links home (owner's decision of 19 Nov 2026). */}
      <div className="mx-auto w-full max-w-[32.5rem]">
        <SectionLabel as="p" className="m-0 mb-4">
          From Instagram
        </SectionLabel>
        {/* On a phone held upright, one sentence to a line, set a step
            smaller so the longest fits the column whole (at 320px too) rather
            than leave single words on lines of their own. */}
        <h1 className="page-title mb-4 max-[560px]:text-[clamp(1.5rem,7.6vw,2.125rem)]">
          <span className="max-[560px]:block">Iconic places.</span>{' '}
          <span className="max-[560px]:block">Extraordinary experiences.</span>{' '}
          <span className="max-[560px]:block">Lifelong connections.</span>
        </h1>
        <p className="prose-body mb-block">
          Small luxury group journeys for an intimate circle of travelers, personally curated by{' '}
          {site.founder.name}.
        </p>

        {lead && (
          <Link href={`/journeys/${lead.slug}`} className="group mb-block block">
            {/* A landscape photograph in an upright frame is drawn about 1.9
                times the frame's width, and `sizes` asks for that. On a phone
                held sideways the upright frame would fill two screens, so
                there it is cropped 2:1 and drawn at the frame's width. */}
            <Frame
              media={lead.promoMedia ?? lead.cardMedia}
              ratio="4/5"
              hover
              priority
              sizes="(orientation: landscape) and (max-height: 500px) 520px, (min-width: 560px) 975px, 170vw"
              className="mb-5 [@media(orientation:landscape)_and_(max-height:500px)]:!aspect-[2/1]"
            />
            <span className="kicker-sm mb-2 block">
              <Facts facts={[lead.country, `${lead.days} days`, lead.departure]} />
            </span>
            <span className="h4 block transition-colors duration-300 group-hover:text-brand">
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
                  <span className="h5 block transition-colors duration-300 group-hover:text-brand">
                    {link.title}
                  </span>
                  <span className="kicker-sm mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {'tag' in link && link.tag && link.tag !== 'open' && (
                      <StatusTag status={link.tag} />
                    )}
                    <Facts facts={link.meta} />
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

/**
 * A caps line of facts, "Switzerland & Italy · 13 days · Dates to be
 * announced". A line breaks between facts, not inside one, and a fact that
 * begins a line drops its dot: the dot sits in the fact's own left padding,
 * and the facts start that much to the left inside a clipping box. A single
 * fact is plain words, balanced when they wrap so no word is left alone.
 */
function Facts({ facts }: { facts: string[] }) {
  if (facts.length < 2) return <span className="text-balance">{facts[0]}</span>;
  return (
    <span className="block min-w-0 overflow-hidden">
      {/* 1em is the room " · " took in the caps (a space either side of the
          dot, each with the letter-spacing), so the line spacing is unchanged. */}
      <span className="-ml-[1em] flex flex-wrap">
        {facts.map((fact, i) => (
          <Fragment key={i}>
            {i > 0 && ' '}
            <span className="relative pl-[1em]">
              <span aria-hidden className="absolute left-0 top-0 w-[1em] text-center">
                ·
              </span>
              {fact}
            </span>
          </Fragment>
        ))}
      </span>
    </span>
  );
}
