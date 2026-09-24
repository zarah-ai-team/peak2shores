import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/Editorial';
import { philosophy } from '@/lib/content';

export function Philosophy() {
  return (
    <section className="gutter editorial-grid border-b border-line pb-20 pt-20 md:pb-[104px] md:pt-[128px]">
      <SectionLabel className="lg:pt-4">01 — Philosophy</SectionLabel>

      <Reveal variant="mask">
        <h2 className="h2">{philosophy.headline}</h2>
      </Reveal>

      <Reveal className="max-w-[440px] lg:pt-4" delay={0.12}>
        {philosophy.body.map((paragraph) => (
          <p key={paragraph} className="prose-body mb-5">
            {paragraph}
          </p>
        ))}
        <ButtonLink href="/our-story" variant="rule" className="mt-3 inline-block">
          How we travel
        </ButtonLink>
      </Reveal>
    </section>
  );
}
