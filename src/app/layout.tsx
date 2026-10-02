import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Preloader } from '@/components/layout/Preloader';
import { PageTransition } from '@/components/layout/PageTransition';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { Analytics } from '@/components/layout/Analytics';
import { consentDefaults } from '@/lib/analytics';
import { jsonLd } from '@/lib/seo';
import { site } from '@/lib/site';

/* Display type is Georgia, a system serif, so nothing is downloaded for it.
   Poppins needs all three of its weights (body 300, labels 400, buttons 500).
   Anything loaded beyond this is a preload competing with the hero. */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-poppins',
  display: 'swap',
});

/**
 * Runs before first paint, ahead of the bundle.
 *
 * - `data-js` tells the stylesheet that JavaScript is present, so effects that
 *   would leave a page unreadable without it (the reveal states, the
 *   dark-ground fade) only exist when they can complete.
 * - `data-preload` holds the page's entrance animations under an ivory cover
 *   for the one visit a day that gets the preloader, so the sequence plays as
 *   the loader lifts rather than underneath it. The Preloader clears it; the
 *   timer here clears it anyway if the bundle is slow, and the Preloader then
 *   stands down rather than covering a page that is already showing.
 */
const boot = `(function(){var d=document.documentElement;d.setAttribute('data-js','');var reduce=false;try{reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}if(reduce)return;var seen=false;try{seen=Date.now()-Number(localStorage.getItem('p2s:preloader-at'))<864e5}catch(e){}if(seen)return;d.setAttribute('data-preload','');setTimeout(function(){if(!d.hasAttribute('data-preload'))return;d.removeAttribute('data-preload');try{localStorage.setItem('p2s:preloader-at',String(Date.now()))}catch(e){}},3200)})();`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.founder.name }],
  openGraph: {
    type: 'website',
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description: site.description,
    url: '/',
    locale: 'en_US',
  },
  // Only the card type lives here. Title and description are set per page
  // through `pageMetadata`, so no page inherits the homepage's copy.
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#f4f1ea',
  colorScheme: 'light',
};

/** Emitted on every page: who publishes this site, and what it is. */
const organization = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${site.url}/#organization`,
      name: site.name,
      legalName: site.legalName,
      url: site.url,
      email: site.email,
      ...(site.phone ? { telephone: site.phone } : {}),
      logo: `${site.url}/brand/logo-dark.png`,
      founder: { '@type': 'Person', name: site.founder.name },
      foundingDate: String(site.founded),
      ...(site.instagram ? { sameAs: [site.instagram] } : {}),
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: site.name,
      publisher: { '@id': `${site.url}/#organization` },
      inLanguage: 'en',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The boot script writes attributes onto <html> before hydration; React
    // must not treat them as a mismatch.
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        {/* Consent Mode defaults must exist before Tag Manager loads. */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <script dangerouslySetInnerHTML={{ __html: consentDefaults }} />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(organization) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[120] focus:bg-ink focus:px-5 focus:py-3 focus:font-ui focus:text-[11px] focus:uppercase focus:tracking-[0.16em] focus:text-ivory"
        >
          Skip to content
        </a>
        <MotionProvider>
          <Preloader />
          <ScrollProgress />
          <Header />
          {/* Focusable so the skip link lands reliably in every browser. */}
          <main id="main" tabIndex={-1} className="outline-none">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
          <Analytics />
        </MotionProvider>
      </body>
    </html>
  );
}
