'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Arrow } from './Button';
import { useDragScroll } from '@/components/ui/useDrag';

/**
 * A horizontal rail of items: native overflow scrolling with snap points, so
 * touch, trackpad and keyboard all work as the platform intends. No pinning,
 * no scroll-jacking, no autoplay.
 *
 * The track is a focusable, labelled region (arrow keys scroll it natively).
 * Previous / next buttons move by one item — smoothly, or instantly under
 * reduced motion — and disable at either end. The buttons are a convenience,
 * not the only way through: hidden from nothing, they are simply ordinary
 * buttons after the track in reading order.
 *
 * `controls="before"` puts the buttons above the track, in reading order as
 * well as on screen, so keyboard order matches what is seen.
 *
 * `bleed="right"` starts the rail at the container's left edge and lets it
 * run off the right of the viewport (place the Rail outside `.container-site`).
 */
export function Rail({
  items,
  label,
  itemClassName = 'w-[clamp(16.25rem,22.25vw,26.25rem)]',
  tone = 'light',
  bleed = 'none',
  className = '',
  controlsClassName = '',
  controls = 'after',
}: {
  items: ReactNode[];
  /** Accessible name of the region, e.g. "Experiences". */
  label: string;
  /** Width (and anything else) for each item. */
  itemClassName?: string;
  tone?: 'light' | 'dark';
  bleed?: 'none' | 'right';
  className?: string;
  controlsClassName?: string;
  /** Where the previous / next buttons sit relative to the track. */
  controls?: 'before' | 'after';
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  useDragScroll(trackRef);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    let frame = 0;
    const onScroll = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          measure();
        });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [measure]);

  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const list = el.firstElementChild as HTMLElement | null;
    const first = list?.firstElementChild as HTMLElement | null;
    const gap = list ? parseFloat(getComputedStyle(list).columnGap) || 0 : 0;
    const by = (first?.offsetWidth ?? el.clientWidth * 0.8) + gap;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * by, behavior: reduced ? 'auto' : 'smooth' });
  };

  const button =
    tone === 'dark'
      ? 'border-on-dark/60 text-on-dark hover:bg-brand hover:border-brand hover:text-white'
      : 'border-ink/60 text-ink hover:bg-brand hover:border-brand hover:text-white';

  const controlsBar = (
    <div
      className={`container-site ${controls === 'before' ? 'mb-6' : 'mt-8'} flex justify-end gap-2 ${controlsClassName}`}
    >
      <button
        type="button"
        onClick={() => step(-1)}
        disabled={atStart}
        aria-label={`Previous — ${label}`}
        className={`flex size-(--btn-h) items-center justify-center border transition-colors duration-300 disabled:pointer-events-none disabled:opacity-30 ${button}`}
      >
        <Arrow className="btn-arrow--back rotate-180" />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        disabled={atEnd}
        aria-label={`Next — ${label}`}
        className={`flex size-(--btn-h) items-center justify-center border transition-colors duration-300 disabled:pointer-events-none disabled:opacity-30 ${button}`}
      >
        <Arrow />
      </button>
    </div>
  );

  return (
    <div className={className} data-tone={tone}>
      {controls === 'before' && controlsBar}
      <div
        ref={trackRef}
        role="region"
        aria-label={label}
        tabIndex={0}
        className={`rail-track ${bleed === 'right' ? 'rail-bleed-right' : ''}`}
      >
        <ul className="rail-list m-0 list-none py-0">
          {items.map((item, i) => (
            <li key={i} className={itemClassName}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      {controls === 'after' && controlsBar}
    </div>
  );
}
