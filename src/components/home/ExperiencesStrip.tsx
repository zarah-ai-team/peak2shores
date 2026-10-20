'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as m from 'motion/react-m';
import { Frame } from '@/components/ui/Frame';
import { ButtonLink } from '@/components/ui/Button';
import { SectionLabel } from '@/components/ui/Editorial';
import type { Experience } from '@/lib/content';
import type { MediaKey } from '@/lib/media';
import { ease } from '@/lib/motion';

/** The four the homepage names. "Stay" is the hotels section's job. */
const HOME = ['taste', 'meet', 'discover', 'move'];

/**
 * 4.8 — 07 Experiences (photograph, dark).
 *
 * Four words, set very large over one full-bleed photograph. Hovering or
 * focusing a word brings up its own picture and its one-line description;
 * each word is a link to its chapter on /experiences. The first is up from
 * the start, so the section reads the same without a pointer.
 */
export function ExperiencesStrip({ experiences }: { experiences: Experience[] }) {
  const items = experiences.filter((e) => HOME.includes(e.slug));
  const [active, setActive] = useState(0);
  const current = items[active] ?? items[0];
  if (!current) return null;

  return (
    <section
      id="experiences"
      aria-labelledby="experiences-title"
      data-tone="dark"
      className="relative isolate flex min-h-[min(100svh,960px)] items-end overflow-hidden bg-forest-deep text-on-dark"
    >
      <div className="absolute inset-0 -z-10">
        {items.map((experience, i) => (
          <m.div
            key={experience.slug}
            className="absolute inset-0"
            aria-hidden
            initial={false}
            animate={{ opacity: i === active ? 1 : 0, scale: i === active ? 1 : 1.04 }}
            transition={{ duration: 1, ease: ease.editorial }}
          >
            <Frame
              media={`exp-${experience.slug}` as MediaKey}
              decorative
              reveal={false}
              warm={i !== 0}
              sizes="100vw"
              overlay="hero"
              className="h-full"
            />
          </m.div>
        ))}
        <div aria-hidden className="absolute inset-0 bg-forest-deep/25" />
      </div>

      <div className="container-site grid-site w-full gap-y-10 py-section-sm">
        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          <SectionLabel tone="dark" className="mb-8 text-on-dark lg:mb-10">
            07 — What fills the days
          </SectionLabel>
          <h2 id="experiences-title" className="sr-only">
            Experiences
          </h2>
          <ul className="m-0 list-none p-0">
            {items.map((experience, i) => (
              <li key={experience.slug}>
                <Link
                  href={`/experiences#${experience.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  aria-describedby={i === active ? 'experience-line' : undefined}
                  className={`display block leading-[1.02] transition-colors duration-500 ${
                    i === active ? 'text-on-dark' : 'text-on-dark/45 hover:text-on-dark'
                  }`}
                >
                  {experience.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:self-end lg:pb-4">
          <p id="experience-line" className="lead mb-8 text-on-dark">
            {current.body}
          </p>
          <ButtonLink href="/experiences" variant="light">
            All experiences
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
