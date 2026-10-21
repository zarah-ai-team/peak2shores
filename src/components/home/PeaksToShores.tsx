import { Frame } from '@/components/ui/Frame';
import { Reveal, RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { SectionLabel } from '@/components/ui/Editorial';
import { peaksToShores as defaultContent, type HomeContent } from '@/lib/content';
import { Section } from '@/components/ui/Section';
import { PeaksShoresSlider } from './PeaksShoresSlider';

type Content = HomeContent['peaksToShores'];

/*
 * The signature strip runs Alps → alpine lake → Mediterranean → Miami across
 * twelve columns as a staggered, descending line of unequal frames: each a
 * different shape, each set a little lower or higher than its neighbour, so
 * the eye travels down and across like a route on a map (DESIGN-SPEC §4.3).
 * On a phone it becomes two columns, alternating tall and square, the second
 * column dropped by 48px.
 */
const signature = [
  { ratio: 'aspect-[2/3]', offset: 'lg:mt-0', mobile: 'aspect-[2/3]' },
  { ratio: 'lg:aspect-square', offset: 'mt-12 lg:mt-16', mobile: 'aspect-square' },
  { ratio: 'lg:aspect-[4/5]', offset: 'lg:mt-8', mobile: 'aspect-[2/3]' },
  { ratio: 'lg:aspect-[3/4]', offset: 'mt-12 lg:mt-28', mobile: 'aspect-square' },
] as const;

/**
 * 4.3 — The name (forest).
 *
 * `variant="signature"` is the homepage composition: the name, then one
 * full-bleed Peaks/Shores picture the reader drags across (PeaksShoresSlider)
 * — it replaced the four-frame strip in the October 2026 review. On a desktop
 * the name and the picture share one screen, the picture taking what is left. `variant="compact"` (the default, used by
 * /destinations) keeps the headline and lays the four frames in an even
 * strip. Both are server-rendered; each frame drifts a few pixels on scroll
 * through Frame's own parallax, pinned under reduced motion.
 */
export function PeaksToShores({
  content = defaultContent,
  variant = 'compact',
  label = '02 — The name',
}: {
  content?: Content;
  variant?: 'signature' | 'compact';
  label?: string;
}) {
  const [peaks, two, shores] = content.headlineParts;
  const isSignature = variant === 'signature';

  if (isSignature) {
    return (
      <Section
        contained={false}
        ground="forest"
        screen
        id="destinations"
        aria-labelledby="p2s-title"
        className="lg:pb-0"
      >
        <div className="container-site grid-site gap-y-8 max-lg:pb-section-sm lg:items-end lg:pb-[4svh]">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <SectionLabel tone="dark" className="mb-8 lg:mb-[2.5svh]">
              {label}
            </SectionLabel>
            <Reveal variant="mask">
              <h2 id="p2s-title" className="display">
                {peaks} <span className="text-acqua">{two}</span> {shores}
              </h2>
            </Reveal>
          </div>
          <Reveal
            delay={0.1}
            className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8 lg:pb-3"
          >
            <p className="prose-body measure text-on-dark-body">{content.between}</p>
            <p className="kicker-sm mt-6 text-on-dark-muted">
              Drag to travel from one to the other
            </p>
          </Reveal>
        </div>
        <PeaksShoresSlider content={content} />
      </Section>
    );
  }

  return (
    <Section
      contained={false}
      ground="forest"
      id="destinations"
      aria-labelledby="p2s-title"
      // The strip's staggered floor already reads as a pause; a full section's
      // padding under it left a band of empty forest (DESIGN-REVIEW P2.10).
      className="pb-section-sm"
    >
      <div className="container-site">
        <div className="grid-site gap-y-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <SectionLabel tone="dark" className="mb-8 lg:mb-10">
              {label}
            </SectionLabel>
            <Reveal variant="mask">
              <h2 id="p2s-title" className={isSignature ? 'display' : 'h2'}>
                {peaks} <span className="text-acqua">{two}</span> {shores}
              </h2>
            </Reveal>
          </div>
          <Reveal
            delay={0.1}
            className="col-span-4 md:col-span-6 lg:col-span-5 lg:col-start-8 lg:self-end"
          >
            <p className="prose-body measure text-on-dark-body">{content.body}</p>
          </Reveal>
        </div>

        <RevealGroup
          as="ol"
          stagger={0.08}
          className="grid-site m-0 mt-block list-none gap-y-12 p-0 lg:mt-[clamp(80px,8vw,128px)]"
        >
          {content.frames.map((frame, i) => {
            const shape = signature[i % signature.length];
            const ratio = isSignature ? `${shape.mobile} ${shape.ratio}` : 'aspect-[3/4]';
            return (
              <RevealItem
                as="li"
                key={frame.media}
                distance={16}
                className={`col-span-2 md:col-span-4 lg:col-span-3 ${
                  isSignature ? shape.offset : i % 2 ? 'mt-12 md:mt-0' : ''
                }`}
              >
                <figure className="m-0">
                  <Frame
                    media={frame.media}
                    parallax={28 + i * 6}
                    decorative
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 50vw"
                    className={ratio}
                  />
                  <figcaption className="mt-5 border-t border-line-dark pt-4">
                    <span className="kicker-sm mb-2 block text-on-dark-muted">{frame.n}</span>
                    <span className="h5 block text-on-dark">{frame.label}</span>
                  </figcaption>
                </figure>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </Section>
  );
}
