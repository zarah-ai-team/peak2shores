import Link from 'next/link';
import Image from 'next/image';
import { site, whatsappHref } from '@/lib/site';
import type { Navigation } from '@/lib/content';
import { FooterSignup } from '@/components/layout/FooterSignup';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { Ground } from '@/components/motion/Ground';

const link = 'transition-colors duration-300 hover:text-acqua';

/**
 * The page ends dark: navy-deep, with the closing line and the journal
 * sign-up, then the brand, the two footer groups and the contact column, then
 * the legal row. Phone, WhatsApp and the Seller of Travel number appear only
 * when they are set in `site.ts` — nothing is shown that hasn't been confirmed.
 */
export function Footer({ nav }: { nav: Pick<Navigation, 'footer' | 'legal'> }) {
  return (
    <Ground as="footer" data-tone="dark" className="bg-navy-deep pb-10 text-on-dark">
      <div className="container-site">
        {/* Navy sections often end the page; navy against navy-deep
            barely differs, so the footer opens on its own rule. */}
        <div aria-hidden className="border-t border-line-dark" />
        <div className="grid-site gap-y-12 pb-block pt-section">
          <Reveal variant="mask" className="col-span-full lg:col-span-7">
            <p className="h2 m-0">
              Iconic places. Extraordinary experiences. Lifelong connections.
            </p>
          </Reveal>
          <Reveal
            delay={0.1}
            className="col-span-full md:col-span-6 lg:col-span-5 lg:col-start-8 lg:self-end"
          >
            <FooterSignup />
          </Reveal>
        </div>

        <RevealGroup
          className="grid-site gap-y-12 border-t border-line-dark pt-12"
          stagger={0.08}
          amount={0.1}
        >
          <RevealItem className="col-span-full md:col-span-4 lg:col-span-4">
            <Link
              href="/"
              aria-label={`${site.name} — home`}
              className="mb-6 inline-flex min-h-11 items-center"
            >
              <Image
                src="/brand/p2s-logo-white.png"
                alt=""
                width={2454}
                height={1017}
                sizes="100px"
                className="h-11 w-auto"
              />
            </Link>
            <p className="prose-body-sm max-w-[300px]">
              Curated travel experiences. Small luxury group journeys of never more than{' '}
              {site.maxGuests} guests, personally curated by {site.founder.name}.
            </p>
          </RevealItem>

          {nav.footer.map((group) => (
            <RevealItem key={group.label} className="col-span-2 lg:col-span-2">
              <nav aria-label={group.label} className="flex flex-col">
                <p className="kicker-sm m-0 mb-4">{group.label}</p>
                {group.items.map((item) => (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    className={`prose-body-sm py-1.5 ${link}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </RevealItem>
          ))}

          <RevealItem className="col-span-full md:col-span-8 lg:col-span-3 lg:col-start-10">
            <p className="kicker-sm m-0 mb-4">{site.locations}</p>
            <p className="prose-body-sm m-0 flex flex-col items-start">
              <a href={`mailto:${site.email}`} className={`py-1.5 ${link}`}>
                {site.email}
              </a>
              {site.phone && site.phoneHref && (
                <a href={`tel:${site.phoneHref}`} className={`py-1.5 ${link}`}>
                  {site.phone}
                </a>
              )}
              {site.whatsapp && (
                <a
                  href={whatsappHref() ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`py-1.5 ${link}`}
                >
                  WhatsApp
                </a>
              )}
              {site.instagram && (
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`py-1.5 ${link}`}
                >
                  @Peaks2Shores
                </a>
              )}
            </p>
          </RevealItem>
        </RevealGroup>

        <div className="kicker-sm mt-14 flex flex-col gap-4 border-t border-line-dark pt-6 text-on-dark-muted lg:flex-row lg:justify-between">
          <span className="flex flex-wrap gap-x-6 gap-y-2">
            <span>
              © {new Date().getFullYear()} {site.legalName}
            </span>
            {site.sellerOfTravel && <span>Seller of Travel Reg. No. {site.sellerOfTravel}</span>}
          </span>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-1">
            {nav.legal.map((item) => (
              <Link key={item.href} href={item.href} className={`py-1.5 ${link}`}>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </Ground>
  );
}
