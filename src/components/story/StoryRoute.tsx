'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';

export type RouteStop = { n?: string; label: string; src?: string; alt?: string };

const DWELL = 4200;

/**
 * The name as a working timeline: a ruled line with a stop at
 * each place, the line filling in blue up to the current stop, and that
 * stop's photograph beside it. While the section is on screen it walks the
 * route on its own; pointing at, focusing or choosing a stop holds it there.
 * Under reduced motion it waits to be chosen.
 */
export function StoryRoute({ stops }: { stops: RouteStop[] }) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [visible, setVisible] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || held || reduced) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % stops.length), DWELL);
    return () => window.clearTimeout(timer);
  }, [active, visible, held, reduced, stops.length]);

  const fill = stops.length > 1 ? (active / (stops.length - 1)) * 100 : 100;
  const current = stops[active];

  return (
    <div
      ref={root}
      className="grid gap-block lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center"
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
    >
      <div>
        <div className="relative">
          {/* The route: one ruled line, filled in blue as far as the current stop. */}
          <span aria-hidden className="absolute inset-x-0 top-[3px] h-px bg-line" />
          <span
            aria-hidden
            className="absolute left-0 top-[2px] h-[3px] bg-acqua transition-[width] duration-700 ease-out motion-reduce:transition-none"
            style={{ width: `${fill}%` }}
          />
          <ol className="relative m-0 grid list-none grid-cols-2 gap-y-10 p-0 sm:grid-cols-4">
            {stops.map((stop, i) => {
              const on = i === active;
              const passed = i <= active;
              return (
                <li key={stop.label} className="relative pr-4">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setActive(i)}
                    onPointerEnter={() => setActive(i)}
                    className="group block w-full cursor-pointer pt-9 text-left"
                  >
                    <span
                      aria-hidden
                      className={`absolute left-0 top-[-3px] block size-[13px] rounded-full border-2 transition-all duration-500 motion-reduce:transition-none ${
                        passed ? 'border-acqua bg-acqua' : 'border-line bg-panel'
                      } ${on ? 'scale-125 shadow-[0_0_0_6px_rgb(122_204_253/0.25)]' : ''}`}
                    />
                    <span className="kicker-sm mb-2 block">
                      {String(i + 1).padStart(2, '0')}
                      {stop.n && ` · ${stop.n}`}
                    </span>
                    <span
                      className={`h4 block transition-colors duration-500 ${
                        on ? 'text-acqua-text' : 'group-hover:text-acqua-text'
                      }`}
                    >
                      {stop.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <figure className="relative m-0 aspect-[4/3] overflow-hidden rounded-[6px] bg-navy-deep">
        {stops.map((stop, i) =>
          stop.src ? (
            <Image
              key={stop.label}
              src={stop.src}
              alt={i === active ? (stop.alt ?? '') : ''}
              aria-hidden={i !== active}
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className={`object-cover transition-opacity duration-700 motion-reduce:transition-none ${
                i === active ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ) : null,
        )}
        <figcaption
          aria-live="polite"
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-6 pb-5 pt-12 text-white"
        >
          {current.n && <span className="kicker-sm block text-white/80">{current.n}</span>}
          <span className="h5 block">{current.label}</span>
        </figcaption>
      </figure>
    </div>
  );
}
