'use client';

import { useState } from 'react';
import { Frame } from '@/components/ui/Frame';
import type { MediaKey } from '@/lib/media';
import type { Pillar } from '@/lib/content';

/**
 * The four principles as cards that open on hover, focus or tap.
 *
 * On a desktop they stand side by side at most of a screen's height; the open
 * one takes most of the row and shows its line and paragraph, the others
 * narrow to a photograph, a number and a name. On a phone they stack, and
 * the open one grows tall enough for its text. One card is always open, so
 * nothing is hidden from a reader who never interacts.
 *
 * Each title is a real heading wrapping a disclosure button; the text panel is
 * always in the document (screen readers reach every principle) and only
 * visually collapsed.
 */
export function PrincipleCards({ pillars }: { pillars: Pillar[] }) {
  const [open, setOpen] = useState(0);

  return (
    <ol className="m-0 flex list-none flex-col gap-3 p-0 lg:h-[min(78svh,760px)] lg:flex-row">
      {pillars.map((pillar, i) => {
        const active = i === open;
        const panelId = `principle-${pillar.n}`;
        return (
          <li
            key={pillar.n}
            onMouseEnter={() => setOpen(i)}
            onFocusCapture={() => setOpen(i)}
            className={`group relative isolate overflow-hidden bg-forest-deep text-on-dark motion-safe:transition-[flex-grow,height] motion-safe:duration-700 motion-safe:ease-[var(--ease-editorial)] ${
              active ? 'h-[480px] lg:h-auto lg:grow-[3.2]' : 'h-28 lg:h-auto lg:grow'
            } lg:basis-0`}
          >
            <div className="absolute inset-0 -z-10">
              <Frame
                media={`principle-${i + 1}` as MediaKey}
                decorative
                reveal={false}
                sizes="(min-width: 1024px) 55vw, 100vw"
                overlay="caption"
                className="h-full"
              />
              <div
                aria-hidden
                className={`absolute inset-0 bg-forest-deep transition-opacity duration-700 ${
                  active ? 'opacity-20' : 'opacity-50'
                }`}
              />
            </div>

            <div className="flex h-full flex-col justify-end p-6 lg:p-8">
              <h3 className="m-0">
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-expanded={active}
                  aria-controls={panelId}
                  className="flex w-full items-baseline gap-4 text-left after:absolute after:inset-0 after:content-['']"
                >
                  <span className="kicker text-on-dark">{pillar.n}</span>
                  <span className="h4 text-on-dark">{pillar.title}</span>
                </button>
              </h3>
              <div
                id={panelId}
                className={`grid transition-[grid-template-rows,opacity] duration-700 ${
                  active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden">
                  <p className="lead mt-5 max-w-[30ch] text-on-dark">{pillar.lead}</p>
                  <p className="prose-body-sm mt-3 max-w-[44ch] text-on-dark-body">
                    {pillar.body}
                  </p>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
