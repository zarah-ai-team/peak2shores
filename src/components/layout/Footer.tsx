import Link from 'next/link';
import Image from 'next/image';
import { footerNav, site } from '@/lib/site';
import { NewsletterForm } from '@/components/ui/NewsletterForm';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';

export function Footer() {
  return (
    <footer className="gutter pb-10 pt-20">
      <RevealGroup
        className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-14"
        stagger={0.1}
        amount={0.1}
      >
        <RevealItem distance={14}>
          <Link href="/" aria-label={`${site.name} — home`}>
            <Image
              src="/brand/logo-dark.png"
              alt={site.name}
              width={900}
              height={485}
              sizes="200px"
              className="mb-5 h-12 w-auto"
            />
          </Link>
          <p className="prose-body-sm max-w-[260px]">
            Curated travel experiences. Small-group journeys of no more than {site.maxGuests}{' '}
            guests, personally curated by {site.founder.name}.
          </p>
        </RevealItem>

        {footerNav.map((group) => (
          <RevealItem key={group.label} distance={14}>
            <nav aria-label={group.label} className="flex flex-col gap-1.5">
              <div className="kicker-sm mb-3">{group.label}</div>
              {group.items.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className="prose-body-sm py-0.5 transition-colors duration-300 hover:text-acqua-text"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </RevealItem>
        ))}

        <RevealItem distance={14}>
          <div className="kicker-sm mb-3">{site.locations}</div>
          <p className="prose-body-sm">
            <a href={`mailto:${site.email}`} className="hover:text-acqua-text">
              {site.email}
            </a>
            {site.phone && (
              <>
                <br />
                <a href={`tel:${site.phoneHref}`} className="hover:text-acqua-text">
                  {site.phone}
                </a>
              </>
            )}
          </p>
          <div className="mt-8">
            <div className="kicker-sm mb-3">The travel journal</div>
            <NewsletterForm compact />
          </div>
        </RevealItem>
      </RevealGroup>

      <Reveal
        direction="none"
        delay={0.2}
        amount={0.5}
        className="mt-12 flex flex-col gap-3 border-t border-line pt-5 font-ui text-[10px] uppercase leading-none tracking-[0.14em] text-muted sm:flex-row sm:justify-between"
      >
        <span>
          © {new Date().getFullYear()} {site.legalName}
        </span>
        <span className="flex gap-6">
          <Link href="/credits" className="py-1 transition-colors duration-300 hover:text-ink">
            Photography credits
          </Link>
          <span>Fewer, better journeys.</span>
        </span>
      </Reveal>
    </footer>
  );
}
