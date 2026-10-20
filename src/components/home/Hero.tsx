'use client';

import { useRef } from 'react';
import * as m from 'motion/react-m';
import { useScroll, useTransform } from 'motion/react';
import { TextReveal } from '@/components/motion/TextReveal';
import { useMotionScale } from '@/components/motion/useMotionScale';
import { ButtonLink } from '@/components/ui/Button';
import { Tick } from '@/components/ui/Tick';
import { enterAt } from '@/lib/motion';
import { HeroReel, HeroReelControls, useHeroReel } from './HeroReel';

/**
 * 4.1 — The opening (film, dark).
 *
 * A short silent reel of Marc's own footage, full bleed. The headline takes
 * nine of twelve columns and sits on the floor of the frame; the standfirst
 * and buttons take the last three, set to its baseline. Below them a hairline
 * carries what the film is and its pause control, bottom right.
 *
 * Entrance, in order: the tick line, the two headline lines, the standfirst,
 * the buttons, the caption — all CSS (`.line-rise`, `.enter`), so the
 * largest paint never waits on the bundle.
 *
 * On scroll the film gives way more slowly than the page and the copy drifts
 * down and fades. Under reduced motion the stylesheet pins both layers
 * (`data-parallax`) and the film waits for the reader to start it.
 */
export function Hero({ maxGuests }: { maxGuests: number }) {
  const { video, paused, autoPlay, toggle } = useHeroReel();
  const ref = useRef<HTMLElement>(null);
  const motionScale = useMotionScale();
  const scaleRef = useRef(motionScale);
  scaleRef.current = motionScale;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const pictureY = useTransform(scrollYProgress, (p) => p * 40 * scaleRef.current);
  const copyY = useTransform(scrollYProgress, (p) => p * 90 * scaleRef.current);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={ref}
      data-hero
      aria-label="Introduction"
      // svh, not vh: the small viewport height does not change when a phone's
      // browser bar collapses, so the hero never jumps mid-scroll.
      className="relative isolate flex h-svh min-h-[600px] flex-col justify-end overflow-hidden bg-forest-deep md:min-h-[640px]"
    >
      <HeroReel video={video} autoPlay={autoPlay} y={pictureY} />
      {/* On a phone the copy stack climbs above the scrim's dark lower half,
          often into sky; a flat tint keeps the kicker and headline legible. */}
      <div aria-hidden className="absolute inset-0 -z-[5] bg-forest-deep/30 md:hidden" />

      <m.div
        data-parallax
        className="container-site pb-[clamp(28px,5vh,56px)] pt-[calc(var(--nav-h)+48px)] text-on-dark"
        style={{ y: copyY, opacity: copyOpacity }}
      >
        <div className="grid-site items-end gap-y-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-9">
            <div
              className="enter kicker mb-7 flex items-start gap-3.5 text-on-dark"
              style={enterAt(0.05)}
            >
              <Tick className="mt-[0.45em] shrink-0" />
              <span>
                Small-group journeys ·{' '}
                <span className="whitespace-nowrap">max. {maxGuests} guests</span>
              </span>
            </div>
            <TextReveal
              as="h1"
              immediate
              delay={0.12}
              className="h1"
              lines={[{ text: 'Luxury travel,' }, { text: 'personally curated.', italic: true }]}
            />
          </div>

          <div className="col-span-4 flex flex-col items-start gap-7 md:col-span-5 lg:col-span-3 lg:pb-[0.6em]">
            <p
              className="enter prose-body measure text-on-dark-body lg:text-on-dark"
              style={enterAt(0.45)}
            >
              Fewer, better journeys to the places one person actually knows — and enough time to be
              there.
            </p>
            <div
              className="enter flex flex-wrap items-center gap-x-8 gap-y-5"
              style={enterAt(0.55)}
            >
              <ButtonLink href="/journeys" variant="light">
                Explore journeys
              </ButtonLink>
              <ButtonLink href="/our-story" variant="rule">
                Our story
              </ButtonLink>
            </div>
          </div>
        </div>

        <div
          className="enter mt-10 flex justify-end border-t border-line-dark lg:mt-14"
          style={enterAt(0.7)}
        >
          <HeroReelControls paused={paused} onToggle={toggle} />
        </div>
      </m.div>
    </section>
  );
}
