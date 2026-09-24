import { Ground } from '@/components/motion/Ground';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/Editorial';

/**
 * The closing invitation on an index page: an ink field that develops as it
 * arrives, a rail label, a headline, a paragraph and one light button.
 */
export function DarkCta({
  kicker,
  headline,
  body,
  href,
  cta,
}: {
  kicker: string;
  headline: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Ground className="gutter editorial-grid bg-ink py-24 text-on-dark md:py-[120px]">
      <SectionLabel tone="dark" className="lg:pt-3.5">
        {kicker}
      </SectionLabel>
      <Reveal variant="mask">
        <h2 className="h3">{headline}</h2>
      </Reveal>
      <Reveal delay={0.12} className="lg:pt-3.5">
        <p className="prose-body mb-8 max-w-[440px] text-on-dark-body">{body}</p>
        <ButtonLink href={href} variant="light">
          {cta}
        </ButtonLink>
      </Reveal>
    </Ground>
  );
}
