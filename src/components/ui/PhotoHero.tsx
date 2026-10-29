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
  /**
   * `full` = 100svh (min 600/640px); `tall` = 92svh (min 620px); `compact` =
   * 68svh (520–720px). A `split` opening sits below the solid header, so from
   * 1024px it gives that height back (min 520px) and the headline lands inside
   * the first screen.
   */
  height?: 'full' | 'tall' | 'compact';
  /** next/image sizes hint; defaults suit the layout. */
  sizes?: string;
  /** Slow push-in on the photograph. */
  drift?: boolean;
  className?: string;
  id?: string;
};

const heights = {
  full: 'h-svh min-h-[37.5rem] md:min-h-[40rem]',
  tall: 'h-[92svh] min-h-[38.75rem]',
  compact: 'h-[68svh] min-h-[32.5rem] max-h-[45rem]',
} as const;

/* Desktop only: below 1024px the split stacks at 70svh (see the Frame). */
const splitHeights = {
  full: 'h-[calc(100svh-var(--nav-h))] min-h-[32.5rem]',
  tall: 'h-[calc(92svh-var(--nav-h))] min-h-[32.5rem]',
  compact: 'h-[calc(68svh-var(--nav-h)/2)] min-h-[30rem] max-h-[42.5rem]',
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
          className={`lg:col-span-7 ${splitHeights[height]} max-lg:h-[70svh] max-lg:min-h-[26.25rem]`}
        />
        <div className="container-site flex flex-col justify-end gap-8 pb-block pt-[calc(var(--nav-h)+3rem)] lg:col-span-5 lg:max-w-none lg:gap-[clamp(1.25rem,1.695vw,2rem)] lg:pl-[var(--grid-gap)]">
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
      <div className="container-site relative flex h-full flex-col justify-end pb-[clamp(2.5rem,7vh,5.5rem)]">
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
