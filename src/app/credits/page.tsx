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
  /** `client` marks media Peaks2Shores supplied itself; anything else is stock. */
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

const authorOf = (row: Credit) => {
  const library = libraries[row.source ?? ''];
  return row.author || (library ? `${library} contributor` : '');
};

/**
 * Attribution for the stock photography.
 *
 * Most frames are Unsplash (no attribution required, credited as a courtesy);
 * the few Wikimedia Commons frames are CC BY-SA and do require visible credit.
 * Generated from the same manifest the sourcing scripts write, so it can never
 * drift from what is on the site. Remove it only once every credited frame has
 * been replaced with commissioned photography.
 *
 * The films and photographs the client supplied are recorded in
 * `reports/image-asset-plan.md`, not in the manifest, because everything under
 * `public/` is served with the site. One of them gets a manifest entry
 * (`source: 'client'`), and so a row here, only once its author and licence
 * are confirmed. The filter below holds back an entry that arrives without them.
 */
export default function CreditsPage() {
  const rows = (Object.values(credits) as Credit[])
    .filter((row) => row.source !== 'client' || (row.author && row.licence))
    .sort((a, b) => a.slot.localeCompare(b.slot));

  return (
    <>
      <PageTitle kicker="Credits" title="Photography." variant="stacked">
        The photographs and films listed below are used under the licenses shown. Each links to its
        source on Unsplash, Pexels or Wikimedia Commons, where the license text and the author’s
        full attribution can be found.
      </PageTitle>

      {/* The table is several screens tall, so the default 15% threshold is
          never reached on a short viewport: start as soon as any of it shows. */}
      <Reveal as="section" amount={0} className="container-site pb-section-sm">
        <table className="block w-full border-collapse text-left sm:table">
          <caption className="sr-only">Photograph, author and license</caption>
          <thead className="hidden sm:table-header-group">
            <tr className="border-b border-line">
              <th scope="col" className="kicker-sm py-4 pr-6 font-medium">
                Photograph
              </th>
              <th scope="col" className="kicker-sm py-4 pr-6 font-medium">
                Author
              </th>
              <th scope="col" className="kicker-sm py-4 font-medium sm:text-right">
                License
              </th>
            </tr>
          </thead>
          <tbody className="block sm:table-row-group">
            {rows.map((row) => (
              <tr
                key={row.slot}
                className="grid gap-1 border-b border-line py-4 sm:table-row sm:py-0"
              >
                <td className="prose-body-sm min-w-0 [overflow-wrap:anywhere] sm:py-4 sm:pr-6 sm:align-top">
                  {row.pageUrl ? (
                    <a href={row.pageUrl} rel="noopener noreferrer license" className="prose-link">
                      {titleOf(row)}
                    </a>
                  ) : (
                    titleOf(row)
                  )}
                </td>
                <td className="prose-body-sm min-w-0 [overflow-wrap:anywhere] sm:py-4 sm:pr-6 sm:align-top">
                  {authorOf(row)}
                </td>
                <td className="kicker-sm sm:whitespace-nowrap sm:py-4 sm:text-right sm:align-top">
                  {row.licence}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </>
  );
}
