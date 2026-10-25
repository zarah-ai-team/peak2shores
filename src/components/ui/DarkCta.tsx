import type { MediaKey } from '@/lib/media';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/Editorial';
import { Frame } from '@/components/ui/Frame';
import { Section } from '@/components/ui/Section';

/**
 * The closing invitation on a page: a dark ground that develops as it arrives,
 * a label, a headline (cols 1–7), then a paragraph and one light button
 * (cols 8–12). Optional 16/9 photograph above.
 */
export function DarkCta({
  kicker,
  headline,
  body,
  href,
  cta,
  ground = 'navy',
  media,
  id,
}: {
  kicker: string;
  headline: string;
  body: string;
  href: string;
  cta: string;
  ground?: 'navy' | 'charcoal';
  media?: MediaKey;
  id?: string;
}) {
  return (
    <Section ground={ground} pad="section-sm" id={id}>
      {media && (
        <Frame
          media={media}
          ratio="16/9"
          sizes="(min-width: 1680px) 1560px, 100vw"
          className="mb-block"
        />
      )}
      <div className="grid-site gap-y-8">
        <div className="col-span-full lg:col-span-7">
          <SectionLabel tone="dark" className="mb-6">
            {kicker}
          </SectionLabel>
          <Reveal variant="mask">
            <h2 className="h2 m-0">{headline}</h2>
          </Reveal>
        </div>
        <Reveal
          delay={0.1}
          className="col-span-full md:col-span-6 lg:col-span-4 lg:col-start-9 lg:self-end"
        >
          <p className="prose-body mb-8 text-on-dark-body">{body}</p>
          <ButtonLink href={href} variant="light" arrow>
            {cta}
          </ButtonLink>
        </Reveal>
      </div>
    </Section>
  );
}
