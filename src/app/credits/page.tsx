import { PageTitle } from '@/components/ui/Editorial';
import { Reveal } from '@/components/motion/Reveal';
import { pageMetadata } from '@/lib/seo';
import credits from '../../../public/images/credits.json';

export const metadata = pageMetadata({
  title: 'Photography credits',
  description: 'Sources and licenses for the photographs on this site.',
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
 * Attribution for the stock photography.
 *
 * Most frames are Unsplash (no attribution required, credited as a courtesy);
 * the few Wikimedia Commons frames are CC BY-SA and do require visible credit.
 * Generated from the same manifest the sourcing scripts write, so it can never
 * drift from what is on the site. Remove it only once every credited frame has
 * been replaced with commissioned photography.
 */
export default function CreditsPage() {
  const rows = (Object.values(credits) as Credit[]).sort((a, b) => a.slot.localeCompare(b.slot));

  return (
    <>
      <PageTitle kicker="Credits" title="Photography." variant="stacked">
        The photographs on this site are used under the licenses listed below. Each links to its
        source on Unsplash or Wikimedia Commons, where the license text and the author’s full
        attribution can be found.
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
                  <a href={row.pageUrl} rel="noopener noreferrer license" className="prose-link">
                    {row.title
                      .replace(/^File:/, '')
                      .replace(/\.[a-z]+$/i, '')
                      .replace(/_/g, ' ')}
                  </a>
                </td>
                <td className="prose-body-sm min-w-0 [overflow-wrap:anywhere] sm:py-4 sm:pr-6 sm:align-top">
                  {row.author}
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
