import { LegalPage, legalRobots } from '@/components/ui/LegalPage';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = {
  ...pageMetadata({
    title: 'Privacy policy',
    description: `How ${site.name} collects, uses and protects personal information, and the rights of travellers in California and other US states.`,
    path: '/privacy',
  }),
  robots: legalRobots,
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="What we collect when you enquire, travel or read with us, why, and the choices you have."
      updated="October 2026"
      sections={[
        {
          heading: 'Who we are',
          body: [
            `${site.legalName}, ${site.locations}. Contact for privacy questions: ${site.email}.`,
          ],
        },
        {
          heading: 'What we collect',
          body: [
            'Details you give us: name, email, phone, travel dates, party size and anything you write in an enquiry, question or newsletter sign-up; passport, dietary and health details when you book a journey.',
            'Details collected automatically: how you reached the site (for example an Instagram post or an advertisement, recorded in a first-party cookie for 90 days), pages visited, device and approximate location, through analytics and advertising tags.',
          ],
        },
        {
          heading: 'How we use it',
          body: [
            'To reply to enquiries and plan journeys; to operate bookings with hotels and partners; to send the newsletter you asked for; to understand which channels bring travellers to us; to meet legal obligations.',
          ],
        },
        {
          heading: 'Cookies, analytics and advertising',
          body: [
            'Which tools are used (Google Analytics, Google Ads, Meta Pixel), what each does, and how to switch them off. See the cookie notice for the full list.',
          ],
        },
        {
          heading: 'Who we share it with',
          body: [
            'Hotels, guides and transport partners for a booked journey; service providers who run our email, website and analytics; authorities where the law requires. We do not sell personal information for money.',
          ],
        },
        {
          heading: 'Your rights in California and other US states',
          body: [
            'Under the California Consumer Privacy Act (as amended by the CPRA) and similar laws in other states: the right to know, access, correct and delete personal information; to opt out of its “sale” or “sharing” for cross-context advertising; to limit use of sensitive information; and not to be treated differently for using these rights.',
            'How to make a request, how we verify it, and how we respond to Global Privacy Control signals.',
          ],
        },
        {
          heading: 'Do Not Sell or Share My Personal Information',
          body: [
            'How to opt out of advertising cookies and of data sharing with advertising platforms.',
          ],
        },
        {
          heading: 'How long we keep it',
          body: [
            'Retention periods for enquiries, bookings, newsletter records and analytics data.',
          ],
        },
        {
          heading: 'Visitors outside the United States',
          body: [
            'For visitors in the UK, EU and Switzerland: the legal basis for each use, consent for cookies, international transfers, and how to complain to a regulator.',
          ],
        },
        {
          heading: 'Children',
          body: [
            'The site is not directed at children under 16, and we do not knowingly collect their information online.',
          ],
        },
        {
          heading: 'Changes to this policy',
          body: ['How we tell you about material changes.'],
        },
      ]}
    />
  );
}
