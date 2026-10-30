import Link from 'next/link';
import Image from 'next/image';
import { site, whatsappHref } from '@/lib/site';
import type { Navigation } from '@/lib/content';
import { FooterSignup } from '@/components/layout/FooterSignup';
import { RevealGroup, RevealItem } from '@/components/motion/Reveal';
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
        <div className="grid-site gap-y-10 pb-[clamp(2.5rem,3.5vw,3.5rem)] pt-[clamp(4rem,5.5vw,6rem)]">
          <FooterSignup />
        </div>

        <RevealGroup
          className="grid-site gap-y-10 border-t border-line-dark pt-10 lg:pt-[clamp(2rem,2.54vw,3rem)]"
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
                src="/brand/p2s-logo-white.svg"
                alt={site.name}
                unoptimized
                width={2454}
                height={1017}
                className="h-12 w-auto lg:h-[clamp(2.75rem,2.9vw,3.375rem)]"
              />
            </Link>
            <p className="prose-body-sm max-w-[20rem]">
              Thoughtfully curated luxury small-group journeys and bespoke private travel, brought
              to life through exceptional hospitality and trusted local expertise.
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
              <a href={site.bookingUrl ?? '/plan#contact'} className={`py-1.5 ${link}`}>
                Book a call
              </a>
              {site.instagram && (
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 py-1.5 ${link}`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    aria-hidden
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4.2" />
                    <circle cx="17.4" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
                  </svg>
                  @Peaks2Shores
                  <span className="sr-only"> on Instagram</span>
                </a>
              )}
            </p>
          </RevealItem>
        </RevealGroup>

        <div className="kicker-sm mt-10 flex flex-col gap-4 border-t border-line-dark pt-6 text-on-dark-muted lg:mt-[clamp(2.25rem,2.97vw,3.5rem)] lg:flex-row lg:justify-between">
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
