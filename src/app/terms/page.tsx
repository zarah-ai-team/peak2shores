import { LegalPage, legalRobots } from '@/components/ui/LegalPage';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = {
  ...pageMetadata({
    title: 'Website terms',
    description: `The terms that apply to using the ${site.name} website.`,
    path: '/terms',
  }),
  robots: legalRobots,
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Website terms"
      intro="The terms that apply to using this website. Booking a journey is covered separately by the booking terms."
      updated="October 2026"
      sections={[
        {
          heading: 'About these terms',
          body: [
            `Who operates the site (${site.legalName}) and that using it means accepting these terms.`,
          ],
        },
        {
          heading: 'Information on the site',
          body: [
            'Itineraries, hotels, prices and dates are described in good faith and may change; a journey is confirmed only by a booking under the booking terms. Prices are per person in US dollars unless stated.',
          ],
        },
        {
          heading: 'Photographs and content',
          body: [
            'Ownership of the text and photography, licensed images (see the photography credits page), and what visitors may and may not reuse.',
          ],
        },
        {
          heading: 'Links to other sites',
          body: ['That linked sites are not under our control.'],
        },
        {
          heading: 'Liability',
          body: ['The limits of our liability for use of the website.'],
        },
        {
          heading: 'Governing law',
          body: ['The law and courts that apply (for example, the State of Florida).'],
        },
      ]}
    />
  );
}
