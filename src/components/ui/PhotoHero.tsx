import type { ReactNode } from 'react';
import type { MediaKey } from '@/lib/media';
import { enterAt, heroTiming } from '@/lib/motion';
import { Frame } from '@/components/ui/Frame';
import { TextReveal, type RevealLine } from '@/components/motion/TextReveal';

type PhotoHeroProps = {
  media: MediaKey;
  kicker?: ReactNode;
  /** A string, or lines (each rises in its own band). */
  title: string | RevealLine[];
  titleSize?: 'page-title' | 'h1' | 'display' | 'h2';
  /** Standfirst, set as `.lead`. Bottom-right on `bleed`, under the title on `split`. */
  lead?: ReactNode;
  /** Buttons or anything else that follows the lead. */
  aside?: ReactNode;
  /**
   * `bleed` (default): full-bleed photograph, copy on it bottom-left.
   * `split`: photograph cols 1–7 at full height, paper text cols 8–12.
   */
  layout?: 'bleed' | 'split';
  /** `full` = 100svh (min 600/640px); `tall` = 92svh (min 620px). */
  height?: 'full' | 'tall';
  /** next/image sizes hint; defaults suit the layout. */
  sizes?: string;
  /** Slow push-in on the photograph. */
  drift?: boolean;
  className?: string;
  id?: string;
};

const heights = {
  full: 'h-svh min-h-[600px] md:min-h-[640px]',
  tall: 'h-[92svh] min-h-[620px]',
} as const;

/**
 * The photographic page opening.
 *
 * The headline animates in CSS (`TextReveal immediate` → `.line-rise`), so the
 * largest contentful paint never waits on JavaScript; kicker, lead and aside
 * follow as `.enter` at 0.05 / 0.45 / 0.55s. The photograph is `priority` and
 * never reveals.
 *
 * `bleed` sets `data-hero`, which the header measures to stay transparent
 * over the photograph (the route must also be listed in `isHeroRoute`).
 * `split` deliberately does NOT: half of it is paper, so the header goes solid
 * and the text column clears it with top padding.
 */
export function PhotoHero({
  media,
  kicker,
  title,
  titleSize = 'page-title',
  lead,
  aside,
  layout = 'bleed',
  height = 'full',
  sizes,
  drift = false,
  className = '',
  id,
}: PhotoHeroProps) {
  const lines = typeof title === 'string' ? [{ text: title }] : title;
  const heading = (
    <TextReveal
      as="h1"
      lines={lines}
      immediate
      delay={heroTiming.firstLine}
      className={`${titleSize} m-0`}
    />
  );

  if (layout === 'split') {
    return (
      <section id={id} className={`grid bg-ivory lg:grid-cols-12 ${className}`}>
        <Frame
          media={media}
          priority
          drift={drift}
          sizes={sizes ?? '(min-width: 1024px) 58vw, 100vw'}
          className={`lg:col-span-7 ${heights[height]} max-lg:h-[70svh] max-lg:min-h-[420px]`}
        />
        <div className="container-site flex flex-col justify-end gap-8 pb-block pt-[calc(var(--nav-h)+48px)] lg:col-span-5 lg:max-w-none lg:pl-[var(--grid-gap)]">
          {kicker && (
            <p className="kicker enter m-0" style={enterAt(heroTiming.kicker)}>
              {kicker}
            </p>
          )}
          {heading}
          {lead && (
            <div className="lead enter measure-lead" style={enterAt(heroTiming.lead)}>
              {lead}
            </div>
          )}
          {aside && (
            <div className="enter" style={enterAt(heroTiming.actions)}>
              {aside}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      id={id}
      data-hero
      data-tone="dark"
      className={`relative isolate overflow-hidden bg-navy-deep text-on-dark ${heights[height]} ${className}`}
    >
      <Frame
        media={media}
        priority
        drift={drift}
        overlay="hero"
        sizes={sizes ?? '100vw'}
        className="absolute! inset-0"
      />
      <div className="container-site relative flex h-full flex-col justify-end pb-[clamp(40px,7vh,88px)]">
        <div className="grid-site items-end gap-y-8">
          <div className="col-span-full lg:col-span-8">
            {kicker && (
              <p
                className="kicker enter m-0 mb-6 text-on-dark/80"
                style={enterAt(heroTiming.kicker)}
              >
                {kicker}
              </p>
            )}
            {heading}
          </div>
          {(lead || aside) && (
            <div className="col-span-full flex flex-col gap-8 md:col-span-6 lg:col-span-4 lg:col-start-9">
              {lead && (
                <div
                  className="lead enter measure-lead text-on-dark"
                  style={enterAt(heroTiming.lead)}
                >
                  {lead}
                </div>
              )}
              {aside && (
                <div className="enter" style={enterAt(heroTiming.actions)}>
                  {aside}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
