'use client';

import { useRef } from 'react';
import * as m from 'motion/react-m';
import { useScroll, useTransform } from 'motion/react';
import { Frame } from '@/components/ui/Frame';
import { Ground } from '@/components/motion/Ground';
import { Reveal } from '@/components/motion/Reveal';
import { useMotionScale } from '@/components/motion/useMotionScale';
import { SectionLabel } from '@/components/ui/Editorial';
import { peaksToShores } from '@/lib/content';

/**
 * The signature moment: the name read as a journey.
 *
 * The ink ground develops as the section arrives. Then four frames run
 * Alps → alpine lake → Mediterranean → Miami, each drifting at a slightly
 * different rate as the section passes. The movement is small on purpose —
 * it should register as depth, not as an effect. Under reduced motion the
 * stylesheet pins the frames (`data-parallax`).
 */
export function PeaksToShores() {
  const ref = useRef<HTMLDivElement>(null);
  const motionScale = useMotionScale();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  return (
    <Ground
      id="destinations"
      className="border-b border-line bg-ink pt-20 text-on-dark md:pt-[112px]"
    >
      <div className="gutter editorial-grid mb-12 lg:mb-16">
        <SectionLabel tone="dark" className="lg:pt-4">
          06 — The name
        </SectionLabel>
        <Reveal variant="mask">
          <h2 className="h2">
            {peaksToShores.headlineParts[0]}{' '}
            <span className="text-acqua">{peaksToShores.headlineParts[1]}</span>{' '}
            {peaksToShores.headlineParts[2]}
          </h2>
        </Reveal>
        <Reveal delay={0.12} className="lg:pt-4">
          <p className="prose-body max-w-[460px] text-on-dark-body">{peaksToShores.body}</p>
        </Reveal>
      </div>

      <div ref={ref} className="grid gap-0.5 bg-ink sm:grid-cols-2 lg:grid-cols-4">
        {peaksToShores.frames.map((frame, i) => (
          <ParallaxFrame
            key={frame.media}
            progress={scrollYProgress}
            index={i}
            scale={motionScale}
            frame={frame}
          />
        ))}
      </div>
    </Ground>
  );
}

function ParallaxFrame({
  progress,
  index,
  scale,
  frame,
}: {
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  index: number;
  scale: number;
  frame: (typeof peaksToShores.frames)[number];
}) {
  // Alternating, shallow drift. Even columns rise, odd columns lag. Shallower
  // still on a phone, where the frames stack.
  const distance = (28 + index * 6) * scale;
  const y = useTransform(progress, [0, 1], [distance, -distance]);

  return (
    <div className="relative h-[420px] overflow-hidden lg:h-[620px]">
      <m.div data-parallax className="absolute inset-x-0 -top-12 -bottom-12" style={{ y }}>
        <Frame
          media={frame.media}
          decorative
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="h-full"
          overlay="caption"
        />
      </m.div>
      <div className="pointer-events-none absolute bottom-7 left-7 text-white">
        <div className="mb-2.5 font-ui text-[10px] uppercase leading-none tracking-[0.2em]">
          {frame.n}
        </div>
        <div className="font-display text-[26px] leading-[1.1]">{frame.label}</div>
      </div>
    </div>
  );
}
