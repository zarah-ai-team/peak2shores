import { PageTitle } from '@/components/ui/Editorial';
import { Reveal } from '@/components/motion/Reveal';
import { pageMetadata } from '@/lib/seo';
import credits from '../../../public/images/credits.json';

export const metadata = pageMetadata({
  title: 'Photography credits',
  description: 'Sources and licences for the photographs on this site.',
  path: '/credits',
});

type Credit = {
  slot: string;
  title: string;
  pageUrl: string;
  author: string;
  licence: string;
};

/**
 * Attribution for the placeholder photography.
 *
 * Most of the comps are Creative Commons BY or BY-SA, which require visible
 * credit. This page is generated from the same manifest the fetch script
 * writes, so it can never drift from what is actually on the site. It goes
 * away with the comps: once commissioned photography replaces them, delete the
 * manifest, this route and the footer link together.
 */
export default function CreditsPage() {
  const rows = (Object.values(credits) as Credit[]).sort((a, b) => a.slot.localeCompare(b.slot));

  return (
    <>
      <PageTitle kicker="Credits" title="Photography.">
        The photographs on this site are used under the licences listed below. Each links to its
        source on Wikimedia Commons, where the licence text and the author’s full attribution can be
        found.
      </PageTitle>

      <Reveal as="section" className="gutter pb-24 md:pb-[104px]">
        <ul className="m-0 list-none border-t border-line p-0">
          {rows.map((row) => (
            <li
              key={row.slot}
              className="grid gap-2 border-b border-line py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_140px] sm:gap-6"
            >
              <a
                href={row.pageUrl}
                rel="noopener noreferrer license"
                className="prose-body-sm underline decoration-line underline-offset-4 transition-colors duration-300 hover:text-acqua-text"
              >
                {row.title
                  .replace(/^File:/, '')
                  .replace(/\.[a-z]+$/i, '')
                  .replace(/_/g, ' ')}
              </a>
              <span className="prose-body-sm">{row.author}</span>
              <span className="kicker-sm sm:text-right">{row.licence}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </>
  );
}
