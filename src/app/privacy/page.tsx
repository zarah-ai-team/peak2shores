import { LegalPage, legalRobotsFor } from '@/components/ui/LegalPage';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = {
  ...pageMetadata({
    title: 'Privacy policy',
    description: `How ${site.name} collects, uses and protects personal information, and the rights of travelers in California and other US states.`,
    path: '/privacy',
  }),
  robots: legalRobotsFor(false),
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="What we collect when you inquire, travel or read with us, why, and the choices you have."
      updated="October 2026"
      draft={false}
      sections={[
        {
          heading: 'Who we are',
          body: [
            `This website is operated by ${site.legalName} (“${site.name}”, “we”, “us”), with offices in ${site.locations.replace(' · ', ' and ')}. We are responsible for the personal information described in this policy.`,
            `For any question about your privacy, or to use any of the rights described below, write to ${site.email}. We aim to reply within 30 days.`,
          ],
        },
        {
          heading: 'What we collect',
          body: [
            'Information you give us. When you send an inquiry, ask a question or join our newsletter: your name, email address, phone number, preferred travel dates, number of travelers, and anything you choose to tell us in your message.',
            'When you book a journey. The details needed to arrange your travel: passport and nationality details, date of birth, emergency contact, dietary requirements, accessibility needs and relevant health information, room preferences, and payment records. Health and passport details are used only to make your journey safe and possible.',
            'Information collected automatically. When you visit the site: the pages you view, how you arrived (for example from an Instagram post or an advertisement, remembered in a first-party cookie for 90 days), your device and browser type, and an approximate location derived from your IP address.',
          ],
        },
        {
          heading: 'How we use it',
          body: [
            'To reply to your inquiry and plan a journey with you; to make and manage bookings with hotels, guides, airlines and other partners; to look after you before, during and after your journey; to send the newsletter you asked for; to understand which pages and channels bring travelers to us so we can improve the site; and to meet our legal, accounting and tax obligations.',
            'We do not use automated decision-making that has legal or similarly significant effects on you.',
          ],
        },
        {
          heading: 'Cookies, analytics and advertising',
          body: [
            'We use a small number of cookies of our own, and may use tools such as Google Analytics, Google Ads and the Meta Pixel to measure visits and the performance of our advertising. These tools may set their own cookies and receive information about your visit.',
            'You can decline non-essential cookies, change your choice at any time, or clear cookies in your browser settings. The cookie notice lists each cookie and what it does.',
          ],
        },
        {
          heading: 'Who we share it with',
          body: [
            'The hotels, guides, transport companies and other partners who deliver a journey you have booked, and only what they need to look after you.',
            'Service providers who run our email, website hosting, payments, analytics and advertising on our behalf, under contracts that limit their use of your information.',
            'Professional advisers, insurers, and public authorities where the law requires it or where it is needed to protect the safety of a traveler.',
            'We do not sell your personal information for money.',
          ],
        },
        {
          heading: 'Your rights in California and other US states',
          body: [
            'If you live in California, the California Consumer Privacy Act (as amended by the CPRA) gives you the right to know what personal information we hold about you and how we use it; to access, correct and delete it; to opt out of its “sale” or “sharing” for cross-context behavioral advertising; to limit the use of sensitive personal information; and not to be treated differently for using these rights. Residents of other states with comparable laws, including Colorado, Connecticut, Virginia, Texas and Oregon, have similar rights.',
            `To make a request, email ${site.email} with the subject line “Privacy request”. We will confirm your identity by matching the details you give us with those we hold, and may ask for more information to do so. You may use an authorized agent, who will need your signed permission. If we decline a request, you may appeal by replying to our decision.`,
          ],
        },
        {
          heading: 'Do Not Sell or Share My Personal Information',
          body: [
            'Advertising cookies set on our site may count as “sharing” under California law. To opt out, decline non-essential cookies on this site, or turn on Global Privacy Control in your browser: we treat a Global Privacy Control signal as a valid request to opt out for that browser.',
            `You can also opt out by email to ${site.email}.`,
          ],
        },
        {
          heading: 'How long we keep it',
          body: [
            'Inquiries that do not lead to a booking: up to three years from our last contact, so we can pick up the conversation if you return. Booking records: seven years after your journey, to meet accounting, tax and legal requirements. Passport and health details: deleted within twelve months of your return, unless the law requires otherwise. Newsletter records: until you unsubscribe. Analytics data: no longer than 26 months.',
          ],
        },
        {
          heading: 'How we protect it',
          body: [
            'We use reputable providers, encrypted connections, access controls and limited retention to protect your information. No system is perfectly secure, but if a breach ever affected you, we would tell you and the relevant authorities as the law requires.',
          ],
        },
        {
          heading: 'Visitors outside the United States',
          body: [
            'If you are in the United Kingdom, the European Union or Switzerland, we rely on the following legal bases: performing a contract with you (planning and operating your journey), our legitimate interests (replying to inquiries, improving the site), your consent (newsletter, non-essential cookies), and legal obligations. Health information is processed with your explicit consent, given when you share it.',
            'Your information may be processed in the United States and in the countries your journey visits. Where we transfer it, we rely on appropriate safeguards such as standard contractual clauses. You have the right to access, correct, delete, restrict or object to the use of your information, to data portability, and to withdraw consent at any time; and you may complain to your local data protection authority.',
          ],
        },
        {
          heading: 'Children',
          body: [
            'This site is not directed at children under 16, and we do not knowingly collect their information online. Where a child travels with their family, we collect their details from the booking adult only as needed to arrange the journey.',
          ],
        },
        {
          heading: 'Changes to this policy',
          body: [
            'We may update this policy from time to time. The date at the top of the page shows the latest version. If we make a material change, we will say so clearly on the site and, where we have your email address, tell you directly.',
          ],
        },
      ]}
    />
  );
}
