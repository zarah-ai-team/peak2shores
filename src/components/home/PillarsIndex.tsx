'use client';

import { useEffect, useRef, useState } from 'react';
import * as m from 'motion/react-m';
import { Frame } from '@/components/ui/Frame';
import { RevealGroup, RevealItem } from '@/components/motion/Reveal';
import { Tick } from '@/components/ui/Tick';
import { ease } from '@/lib/motion';
import type { Pillar } from '@/lib/content';

/**
 * The index and its photograph.
 *
 * On desktop the photograph is sticky and cross-fades to whichever pillar is
 * level with the middle of the viewport; the list scrolls past it. On a phone
 * there is no room for two columns, so each pillar carries its own
 * photograph above the text and the sticky stack is not rendered at all.
 *
 * Without JavaScript the first photograph stays up — the inactive layers are
 * serialised at opacity 0 — and the list reads exactly as it does with it.
 */
export function PillarsIndex({ pillars }: { pillars: Pillar[] }) {
  const [active, setActive] = useState(0);
  const items = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.index));
          }
        }
      },
      // A pillar is "current" while it crosses the middle band of the viewport.
      { rootMargin: '-45% 0px -45% 0px' },
    );
    for (const item of items.current) if (item) observer.observe(item);
    return () => observer.disconnect();
  }, []);

  const current = pillars[active] ?? pillars[0];

  return (
    <div className="gutter grid gap-10 pb-20 md:pb-[112px] lg:grid-cols-2 lg:gap-16">
      <div className="hidden lg:block">
        <div className="sticky top-[calc(var(--nav-h)+24px)] aspect-[4/5] max-h-[calc(100svh-var(--nav-h)-48px)]">
          {pillars.map((pillar, i) => (
            <m.div
              key={pillar.media}
              className="absolute inset-0"
              aria-hidden={i !== active}
              animate={{ opacity: i === active ? 1 : 0 }}
              transition={{ duration: 0.8, ease: ease.editorial }}
            >
              <Frame
                media={pillar.media}
                decorative
                reveal={i === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="h-full"
                overlay="caption"
              />
            </m.div>
          ))}
          <div
            aria-hidden
            className="pointer-events-none absolute bottom-7 left-7 flex items-center gap-3 text-white"
          >
            <span className="kicker text-white">{current.n}</span>
            <span className="h-px w-6 bg-gorse" />
            <span className="font-display text-[22px] leading-none">{current.title}</span>
          </div>
        </div>
      </div>

      <RevealGroup as="ul" className="m-0 list-none border-t border-line p-0" stagger={0.06}>
        {pillars.map((pillar, i) => (
          <RevealItem as="li" key={pillar.n} distance={18} className="border-b border-line">
            {/* The observed element is a plain wrapper, so the animated one's
                travel never shifts what the observer measures. */}
            <div
              ref={(el) => {
                items.current[i] = el;
              }}
              data-index={i}
              className="grid gap-5 py-10 lg:py-12"
            >
              <Frame
                media={pillar.media}
                decorative
                sizes="100vw"
                className="mb-2 aspect-[4/3] lg:hidden"
              />
              <div className="kicker flex items-center gap-3">
                {pillar.n}
                <Tick className="w-[22px]" />
              </div>
              <h3 className="h4">{pillar.title}</h3>
              <p className="lead max-w-[460px]">{pillar.lead}</p>
              <p className="prose-body-sm max-w-[460px]">{pillar.body}</p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
