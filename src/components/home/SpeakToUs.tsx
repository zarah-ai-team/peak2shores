import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/Editorial';
import type { HomeContent } from '@/lib/content';
import { site } from '@/lib/site';

/**
 * 4.10 — 09 Speak to a travel designer (photograph, dark).
 *
 * The close, full screen: our audience often wants to talk before booking,
 * so the page ends on the three ways to do that — book a call, call, or
 * WhatsApp — over one wide photograph. Each button exists only when its
 * number or link is set in `site.ts`; "Book a call" falls back to the enquiry
 * form on /plan until a scheduling link is chosen. The ivory Circle follows,
 * so this never runs into the dark footer.
 */
export function SpeakToUs({ speak }: { speak: HomeContent['speak'] }) {
  const bookHref = site.bookingUrl ?? '/plan#contact';
  const whatsappHref = site.whatsapp ? `https://wa.me/${site.whatsapp}` : null;

  return (
    <section
      id="speak"
      aria-labelledby="speak-title"
      data-tone="dark"
      className="relative isolate flex min-h-[min(100svh,920px)] items-end overflow-hidden bg-forest-deep text-on-dark"
    >
      <div className="absolute inset-0 -z-10">
        <Frame
          media="home-talk"
          decorative
          parallax={40}
          overlay="hero"
          sizes="100vw"
          className="h-full"
        />
        <div aria-hidden className="absolute inset-0 bg-forest-deep/45" />
      </div>

      <div className="container-site grid-site w-full gap-y-10 py-section-sm">
        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          <SectionLabel tone="dark" className="mb-8 text-on-dark">
            09 — {speak.label}
          </SectionLabel>
          <Reveal variant="mask">
            <h2 id="speak-title" className="h1 max-w-[14ch]">
              {speak.headline}
            </h2>
          </Reveal>
        </div>

        <Reveal
          delay={0.12}
          className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8 lg:self-end lg:pb-[0.5em]"
        >
          <p className="prose-body mb-8 text-on-dark">{speak.body}</p>
          <div className="flex flex-wrap items-center gap-3">
            <ButtonLink
              href={bookHref}
              variant="light"
              {...(site.bookingUrl ? { target: '_blank', rel: 'noopener' } : {})}
            >
              Book a call
            </ButtonLink>
            {site.phone && site.phoneHref && (
              <ButtonLink href={`tel:${site.phoneHref}`} variant="outline-dark">
                Call {site.phone}
              </ButtonLink>
            )}
            {whatsappHref && (
              <ButtonLink href={whatsappHref} variant="outline-dark" target="_blank" rel="noopener">
                WhatsApp
              </ButtonLink>
            )}
          </div>
          <ButtonLink href="/plan" variant="rule" className="mt-8">
            Or plan your journey online
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
