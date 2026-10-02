import { LegalPage, legalRobots } from '@/components/ui/LegalPage';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

export const metadata = {
  ...pageMetadata({
    title: 'Cookie notice',
    description: `The cookies and similar technologies ${site.name} uses, and how to control them.`,
    path: '/cookies',
  }),
  robots: legalRobots,
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie notice"
      intro="The small files and settings this site stores in your browser, and what each one is for."
      updated="October 2026"
      sections={[
        {
          heading: 'What cookies are',
          body: [
            'Cookies and browser storage let a site remember something between pages or visits. Some are needed for the site to work; others measure visits or support advertising.',
          ],
        },
        {
          heading: 'Cookies we set ourselves',
          body: [
            'p2s_src — remembers how you first reached the site (for example an Instagram post or an advertisement) for 90 days, so an enquiry can be credited to it. Contains no name or email.',
            'p2s:preloader-at (browser storage) — remembers that you have seen the opening animation today, so it does not play on every page.',
          ],
        },
        {
          heading: 'Analytics and advertising',
          body: [
            'Google Analytics, Google Ads and Meta Pixel, loaded through Google Tag Manager: the cookies each sets, how long they last, and what they measure.',
          ],
        },
        {
          heading: 'Your choices',
          body: [
            'How to accept or decline non-essential cookies, how to change your choice later, how Global Privacy Control is honoured, and how to clear cookies in your browser.',
          ],
        },
      ]}
    />
  );
}
