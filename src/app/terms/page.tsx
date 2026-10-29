import { LegalPage, legalRobotsFor } from '@/components/ui/LegalPage';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = {
  ...pageMetadata({
    title: 'Terms & conditions',
    description: `The terms and conditions that apply to using the ${site.name} website.`,
    path: '/terms',
  }),
  robots: legalRobotsFor(false),
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & conditions"
      intro="The terms that apply to using this website. Booking a journey is covered separately by the booking terms."
      updated="October 2026"
      draft={false}
      sections={[
        {
          heading: 'About these terms',
          body: [
            `This website is operated by ${site.legalName} (“${site.name}”, “we”, “us”). By using it, you accept these terms. If you do not agree with them, please do not use the site.`,
            'When you book a journey with us, the booking terms also apply, and they take precedence over these terms for anything to do with your booking.',
          ],
        },
        {
          heading: 'Information on the site',
          body: [
            'We describe our itineraries, hotels, experiences, prices and dates carefully and in good faith, but they may change, and occasional errors can occur. Nothing on the site is an offer that can be accepted: a journey is confirmed only when we confirm your booking in writing under the booking terms.',
            'Prices are per person, in US dollars, and based on shared accommodation unless stated otherwise. Photographs show the kind of places and experiences a journey includes and may not show the exact room, view or season you will experience.',
            'Travel advice on the site, including notes on visas, health and the best time to visit, is general guidance. Please check official sources for your own situation before you travel.',
          ],
        },
        {
          heading: 'Using the site',
          body: [
            'You may use the site for your own personal, non-commercial purposes. You agree not to misuse it: for example, by attempting to gain unauthorized access, interfering with its operation, introducing malicious code, collecting data from it by automated means, or submitting false or misleading inquiries.',
            'Information you send through our forms must be accurate, and you should have permission to share any details you give us about other travelers.',
          ],
        },
        {
          heading: 'Photographs and content',
          body: [
            `The text, design, logo and original photography on this site belong to ${site.legalName} or are used under license from their owners; the photography credits page lists licensed images. You may view, print or share a link to a page for personal use, but you may not copy, reproduce, adapt or republish any content without our written permission.`,
            `${site.name} and the ${site.name} logo are our trademarks and may not be used without our permission.`,
          ],
        },
        {
          heading: 'Links to other sites',
          body: [
            'The site may link to websites run by hotels, partners, social networks and others. We do not control those sites and are not responsible for their content, availability or privacy practices. A link does not mean we endorse the site it points to.',
          ],
        },
        {
          heading: 'Availability of the site',
          body: [
            'We aim to keep the site available and accurate, but we do not guarantee that it will always be uninterrupted, secure or free of errors. We may change, suspend or withdraw any part of it at any time without notice.',
          ],
        },
        {
          heading: 'Liability',
          body: [
            'The site is provided “as is”. To the fullest extent permitted by law, we exclude all warranties, express or implied, and we are not liable for any indirect or consequential loss, or for any loss of data, profit or opportunity, arising from your use of, or inability to use, the site or any content on it.',
            'Nothing in these terms limits any liability that cannot be limited by law. Our responsibilities to travelers on a booked journey are set out in the booking terms.',
          ],
        },
        {
          heading: 'Privacy',
          body: [
            'How we collect and use personal information is explained in our privacy policy and cookie notice, which form part of these terms.',
          ],
        },
        {
          heading: 'Governing law',
          body: [
            'These terms are governed by the laws of the State of Florida, United States, without regard to its conflict of law rules. Any dispute arising from them or from your use of the site will be heard by the state or federal courts located in Miami-Dade County, Florida, unless the law of the country where you live gives you the right to bring proceedings there.',
          ],
        },
        {
          heading: 'Changes to these terms',
          body: [
            'We may update these terms from time to time. The date at the top of the page shows the latest version, and the version published when you use the site is the one that applies.',
          ],
        },
      ]}
    />
  );
}
