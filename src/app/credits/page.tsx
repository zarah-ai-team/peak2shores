import { Fragment } from 'react';
import { PageTitle } from '@/components/ui/Editorial';
import { Reveal } from '@/components/motion/Reveal';
import { pageMetadata } from '@/lib/seo';
import credits from '../../../public/images/credits.json';

export const metadata = pageMetadata({
  title: 'Photography credits',
  description: 'Sources and licenses for the photographs and films credited on this page.',
  path: '/credits',
  noindex: true,
});

type Credit = {
  slot: string;
  /**
   * `client` marks media Peaks2Shores supplied itself, `hotel` a hotel's own
   * photograph (the hotel pop-ups on the journey pages); anything else is stock.
   */
  source?: string;
  title: string;
  pageUrl?: string;
  author: string;
  licence: string;
};

const titleOf = (row: Credit) =>
  row.title
    .replace(/^File:/, '')
    .replace(/\.[a-z]+$/i, '')
    .replace(/_/g, ' ');

/* A stock row whose author is not on record still says where it is from,
   rather than showing an empty cell; its link leads to the full attribution. */
const libraries: Record<string, string> = {
  unsplash: 'Unsplash',
  pexels: 'Pexels',
  wikimedia: 'Wikimedia Commons',
  shutterstock: 'Shutterstock',
};

/** The website a hotel's photograph comes from, "schweizerhof-luzern.ch". */
const siteOf = (row: Credit) =>
  row.pageUrl ? new URL(row.pageUrl).hostname.replace(/^www\./, '') : '';

const authorOf = (row: Credit) => {
  const library = libraries[row.source ?? ''];
  return row.author || (library ? `${library} contributor` : '');
};

/**
 * A website's name that may wrap after a dot, but keeps its last two parts
 * whole: "grandhotelmajestic." then "duetorrihotels.com", never a lone "com".
 * In the table each part holds together, so the column is never squeezed
 * narrower than a part; a phone's stacked row may still break a part that is
 * wider than the screen, rather than run the page off its edge.
 */
const breakAtDots = (host: string) => {
  const labels = host.split('.');
  const parts = [...labels.slice(0, -2).map((label) => `${label}.`), labels.slice(-2).join('.')];
  return parts.map((part, i) => (
    <Fragment key={i}>
      {i > 0 && <wbr />}
      <span className="sm:whitespace-nowrap">{part}</span>
    </Fragment>
  ));
};

/**
 * To a finger, a photograph's link is a 44px target however short its words
 * are: an invisible band centred on them, as on the Plan page's journey
 * titles. Each credit's padding keeps the band clear of the next one's link.
 */
const TITLE_TARGET =
  'relative pointer-coarse:after:absolute pointer-coarse:after:inset-x-0 pointer-coarse:after:top-1/2 pointer-coarse:after:h-11 pointer-coarse:after:-translate-y-1/2';

/**
 * One table of credits: the photograph (linked to its source page), who it is
 * credited to, and a last column (the license for stock, the website it comes
 * from for a hotel's photograph). Below 640px each row stacks.
 *
 * `lastKind` says what that last column holds. A `license` is a few words that
 * never break: below 640px it stands beside the author, so a credit takes two
 * lines rather than three. A `website` stays on a line of its own below 640px,
 * and in the table it may wrap, at its dots only.
 */
function CreditTable({
  rows,
  caption,
  authorHead,
  lastHead,
  last,
  lastKind,
}: {
  rows: Credit[];
  caption: string;
  authorHead: string;
  lastHead: string;
  last: (row: Credit) => string;
  lastKind: 'license' | 'website';
}) {
  const license = lastKind === 'license';
  return (
    <table className="block w-full border-collapse text-left sm:table">
      <caption className="sr-only">{caption}</caption>
      <thead className="hidden sm:table-header-group">
        <tr className="border-b border-line">
          <th scope="col" className="kicker-sm py-4 pr-6 font-medium">
            Photograph
          </th>
          <th scope="col" className="kicker-sm py-4 pr-6 font-medium">
            {authorHead}
          </th>
          <th scope="col" className="kicker-sm py-4 font-medium sm:text-right">
            {lastHead}
          </th>
        </tr>
      </thead>
      <tbody className="block sm:table-row-group">
        {rows.map((row) => (
          <tr
            key={row.slot}
            className={`grid gap-1 border-b border-line py-4 sm:table-row sm:py-0 ${
              license ? 'grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4' : ''
            }`}
          >
            <td
              className={`prose-body-sm min-w-0 [overflow-wrap:anywhere] sm:py-4 sm:pr-6 sm:align-top ${
                license ? 'col-span-2' : ''
              }`}
            >
              {row.pageUrl ? (
                // A stock photograph's page holds its license; the page a
                // hotel's photograph was taken from does not, so it is a plain
                // link.
                <a
                  href={row.pageUrl}
                  rel={
                    row.source === 'hotel' ? 'noopener noreferrer' : 'noopener noreferrer license'
                  }
                  className={`prose-link ${TITLE_TARGET}`}
                >
                  {titleOf(row)}
                </a>
              ) : (
                titleOf(row)
              )}
            </td>
            <td className="prose-body-sm min-w-0 [overflow-wrap:anywhere] sm:py-4 sm:pr-6 sm:align-top">
              {authorOf(row)}
            </td>
            <td
              className={`kicker-sm min-w-0 sm:py-4 sm:text-right sm:align-top ${
                license ? 'whitespace-nowrap text-right' : 'max-sm:[overflow-wrap:anywhere]'
              }`}
            >
              {license ? last(row) : breakAtDots(last(row))}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * Attribution for the stock photography, and for the hotels' own photographs.
 *
 * Most frames are Unsplash (no attribution required, credited as a courtesy);
 * the few Wikimedia Commons frames are CC BY-SA and do require visible credit.
 * Generated from the same manifest the sourcing scripts write, so it can never
 * drift from what is on the site. Remove it only once every credited frame has
 * been replaced with commissioned photography.
 *
 * The hotels' photographs (the hotel pop-ups on the journey pages, and a few
 * elsewhere: the homepage, Where we stay, the ways to travel) come from each
 * hotel's official website; they are listed apart, credited as the hotel
 * gives it, each linked to the page it was taken from.
 *
 * The films and photographs the client supplied are recorded in
 * `reports/image-asset-plan.md`, not in the manifest, because everything under
 * `public/` is served with the site. One of them gets a manifest entry
 * (`source: 'client'`), and so a row here, only once its author and licence
 * are confirmed. The filter below holds back an entry that arrives without them.
 */
export default function CreditsPage() {
  const all = (Object.values(credits) as Credit[]).sort((a, b) => a.slot.localeCompare(b.slot));
  const stock = all.filter(
    (row) => row.source !== 'hotel' && (row.source !== 'client' || (row.author && row.licence)),
  );
  const hotels = all.filter((row) => row.source === 'hotel');

  return (
    <>
      <PageTitle kicker="Credits" title="Photography." variant="stacked">
        The photographs and films listed below are used under the licenses shown. Each links to its
        source on Unsplash, Pexels or Wikimedia Commons, where the license text and the author’s
        full attribution can be found. The hotels’ own photographs follow, each credited to its
        hotel and linked to the hotel’s page it comes from.
      </PageTitle>

      {/* The table is several screens tall, so the default 15% threshold is
          never reached on a short viewport: start as soon as any of it shows. */}
      <Reveal as="section" amount={0} className="container-site pb-section-sm">
        <CreditTable
          rows={stock}
          caption="Photograph, author and license"
          authorHead="Author"
          lastHead="License"
          last={(row) => row.licence}
          lastKind="license"
        />
      </Reveal>

      {hotels.length > 0 && (
        <section className="container-site pb-section-sm" aria-labelledby="credits-hotels">
          <Reveal amount={0}>
            <h2 id="credits-hotels" className="h3 m-0 mb-4">
              The hotels’ photographs
            </h2>
            <p className="prose-body-sm measure m-0 mb-6">
              Most are shown in the hotel pop-ups on the journey pages, a few elsewhere on the site.
              Each photograph is the hotel’s own, taken from its official website and credited as
              the hotel gives it.
            </p>
            <CreditTable
              rows={hotels}
              caption="Hotel photograph, credit and source"
              authorHead="Credit"
              lastHead="Website"
              last={siteOf}
              lastKind="website"
            />
          </Reveal>
        </section>
      )}
    </>
  );
}
