import { Frame } from '@/components/ui/Frame';
import { Reveal } from '@/components/motion/Reveal';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/Editorial';
import { founder } from '@/lib/content';

export function FounderStrip() {
  return (
    <section id="story" className="grid border-b border-line lg:grid-cols-2">
      {/* The cut-out portrait keeps its feet on the frame's floor — no parallax. */}
      <Frame
        media="marc-portrait"
        fit="contain"
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="min-h-[420px] sm:min-h-[560px] lg:min-h-[720px]"
      />

      <Reveal
        direction="left"
        distance={24}
        className="gutter flex flex-col justify-center gap-7 py-16 lg:py-[96px] lg:pr-24"
      >
        <SectionLabel>05 — The founder</SectionLabel>
        <h2 className="h2">{founder.headline}</h2>
        {founder.body.map((paragraph) => (
          <p key={paragraph} className="prose-body max-w-[480px]">
            {paragraph}
          </p>
        ))}
        <blockquote className="lead max-w-[480px] border-l border-gorse pl-6">
          “{founder.quote}”
        </blockquote>
        <ButtonLink href="/our-story" variant="rule" className="self-start">
          Meet Marc
        </ButtonLink>
      </Reveal>
    </section>
  );
}
