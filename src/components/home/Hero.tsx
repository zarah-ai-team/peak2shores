'use client';

import { useRef } from 'react';
import * as m from 'motion/react-m';
import { useScroll, useTransform } from 'motion/react';
import { TextReveal } from '@/components/motion/TextReveal';
import { useMotionScale } from '@/components/motion/useMotionScale';
import { ButtonLink } from '@/components/ui/Button';
import { Tick } from '@/components/ui/Editorial';
import { enterAt } from '@/lib/motion';
import { site } from '@/lib/site';
import { HeroSlides, HeroSlideControls, useHeroCarousel } from './HeroCarousel';

/**
 * The opening.
 *
 * Entrance, in order: the tick line, the two headline lines, the standfirst,
 * the buttons, the slide rules — each about a tenth of a second behind the
 * last, all in CSS so none of it waits on the bundle.
 *
 * On scroll the photograph gives way more slowly than the page (a shallow
 * parallax) and the copy drifts down and fades, so the headline is gone
 * before it can collide with the header. Under reduced motion the stylesheet
 * pins both layers (`data-parallax`).
 */
export function Hero() {
  const { index, go, running, stopped, toggle, containerProps } = useHeroCarousel();
  const ref = useRef<HTMLElement>(null);
  const motionScale = useMotionScale();
  const scaleRef = useRef(motionScale);
  scaleRef.current = motionScale;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const pictureY = useTransform(scrollYProgress, (p) => p * 160 * scaleRef.current);
  const copyY = useTransform(scrollYProgress, (p) => p * 90 * scaleRef.current);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const controls = (
    <HeroSlideControls
      index={index}
      onSelect={go}
      running={running}
      stopped={stopped}
      onToggle={toggle}
    />
  );

  return (
    <section
      ref={ref}
      data-hero
      // svh, not vh: the small viewport height does not change when a phone's
      // browser bar collapses, so the hero never jumps mid-scroll.
      className="relative isolate flex h-svh min-h-[600px] flex-col justify-end overflow-hidden md:min-h-[760px]"
      {...containerProps}
    >
      <HeroSlides index={index} y={pictureY} />

      <m.div
        data-parallax
        className="gutter grid w-full gap-10 pb-14 pt-[140px] text-white md:pb-16 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end lg:gap-12"
        style={{ y: copyY, opacity: copyOpacity }}
      >
        <div>
          <div
            className="enter kicker mb-7 flex items-start gap-3.5 leading-[1.6] text-white"
            style={enterAt(0.05)}
          >
            <Tick className="mt-2 shrink-0" />
            Small-group journeys · max. {site.maxGuests} guests
          </div>
          <TextReveal
            as="h1"
            immediate
            delay={0.15}
            className="h1 max-w-[900px]"
            lines={[{ text: 'Luxury travel,' }, { text: 'personally curated.', italic: true }]}
          />
          <div className="enter mt-10 hidden lg:block" style={enterAt(0.78)}>
            {controls}
          </div>
        </div>

        <div className="flex flex-col items-start gap-6">
          <p
            className="enter font-ui text-[15px] font-light leading-[1.6] text-white"
            style={enterAt(0.5)}
          >
            Fewer, better journeys to the places one person actually knows — and enough time to be
            there.
          </p>
          <div className="enter flex flex-wrap items-center gap-7" style={enterAt(0.62)}>
            <ButtonLink href="/journeys" variant="light">
              Explore journeys
            </ButtonLink>
            <ButtonLink href="/our-story" variant="rule" className="text-white hover:text-acqua">
              Our story
            </ButtonLink>
          </div>
          <div className="enter lg:hidden" style={enterAt(0.78)}>
            {controls}
          </div>
        </div>
      </m.div>
    </section>
  );
}
