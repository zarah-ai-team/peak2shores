'use client';

import { useCallback, useEffect, useState } from 'react';
import * as m from 'motion/react-m';
import { useReducedMotion, type MotionValue } from 'motion/react';
import { Frame } from '@/components/ui/Frame';
import type { MediaKey } from '@/lib/media';
import { ease } from '@/lib/motion';

const heroSlides: { media: MediaKey; label: string }[] = [
  { media: 'home-hero', label: 'The Amalfi Coast' },
  { media: 'home-hero-2', label: 'The Alps' },
  { media: 'home-hero-3', label: 'The open sea' },
];

const INTERVAL = 6500;

/**
 * State for the hero carousel.
 *
 * Kept in a hook so the photographs can sit behind the copy while the controls
 * sit inside it, without either one owning the other.
 *
 * Autoplay pauses on hover, on focus within, and when the tab is hidden; it
 * stops for good when the reader presses the pause control, and it never
 * starts under `prefers-reduced-motion` — in every case the slide controls
 * keep working, so the other photographs stay reachable. The timer restarts on
 * every change of slide, including a manual one, so the rule under the
 * headline always shows the true time to the next.
 */
export function useHeroCarousel() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [stopped, setStopped] = useState(false);

  const running = !reduced && !paused && !stopped;

  const go = useCallback((next: number) => {
    setIndex(((next % heroSlides.length) + heroSlides.length) % heroSlides.length);
  }, []);

  const toggle = useCallback(() => setStopped((s) => !s), []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % heroSlides.length), INTERVAL);
    return () => window.clearInterval(timer);
  }, [running, index]);

  // A carousel advancing in a tab nobody is looking at is wasted bandwidth.
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const containerProps = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocusCapture: () => setPaused(true),
    onBlurCapture: () => setPaused(false),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        go(index + 1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go(index - 1);
      }
    },
  };

  return { index, go, running, stopped, toggle, containerProps };
}

/**
 * The photographs. All three are in the tree from the start — the first with
 * priority, the others fetched at low priority once the page has painted, so
 * the first cross-fade never waits on a network request. They cross-fade
 * rather than slide: the headline sits on top and stays put, so moving the
 * picture sideways under it would read as a glitch. The sequence runs peaks →
 * shores, which is the brand's own story.
 *
 * Each slide pushes in a few percent while it is up, and the whole stack takes
 * the page's scroll at a fraction of its speed.
 */
export function HeroSlides({
  index,
  running,
  y,
}: {
  index: number;
  running: boolean;
  y?: MotionValue<number>;
}) {
  return (
    <m.div
      className="absolute inset-0 -z-10"
      style={y ? { y } : undefined}
      role="group"
      aria-roledescription="carousel"
      aria-label="Peaks2Shores destinations"
    >
      {heroSlides.map((slide, i) => {
        const active = i === index;
        return (
          <m.div
            key={slide.media}
            className="absolute inset-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${heroSlides.length}: ${slide.label}`}
            aria-hidden={!active}
            initial={false}
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 1.2, ease: ease.editorial }}
            style={{ zIndex: active ? 1 : 0 }}
          >
            <Frame
              media={slide.media}
              priority={i === 0}
              warm={i !== 0}
              reveal={false}
              // Toggling the class restarts the push-in each time a slide returns.
              drift={active}
              decorative
              sizes="100vw"
              overlay="hero"
              className="h-full"
            />
          </m.div>
        );
      })}

      {/* Announced politely, so a screen reader hears the change without being
          interrupted mid-sentence — and only once autoplay has stopped, so the
          reader is not talked over every few seconds. */}
      <p aria-live={running ? 'off' : 'polite'} className="sr-only">
        {`Slide ${index + 1} of ${heroSlides.length}: ${heroSlides[index].label}`}
      </p>
    </m.div>
  );
}

/**
 * Flush-left hairline rules, one per slide, and a pause control — the same
 * vocabulary as the rest of the page rather than a stock slider's dots. The
 * active rule fills at the carousel's pace; while autoplay is paused it simply
 * holds, full.
 */
export function HeroSlideControls({
  index,
  onSelect,
  running,
  stopped,
  onToggle,
}: {
  index: number;
  onSelect: (next: number) => void;
  /** Whether autoplay is advancing right now. */
  running: boolean;
  /** Whether the reader has switched autoplay off. */
  stopped: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3">
      {heroSlides.map((slide, i) => (
        <button
          key={slide.media}
          type="button"
          onClick={() => onSelect(i)}
          aria-label={`Show ${slide.label}`}
          aria-current={i === index ? 'true' : undefined}
          className="flex min-h-6 items-center py-2"
        >
          <span className="relative block h-px w-9 overflow-hidden bg-white/45">
            {i === index &&
              (running ? (
                <span
                  key={index}
                  className="hero-progress absolute inset-0 bg-acqua"
                  style={{ animationDuration: `${INTERVAL}ms` }}
                />
              ) : (
                <span className="absolute inset-0 bg-acqua" />
              ))}
          </span>
        </button>
      ))}
      <span className="ml-1 font-ui text-[10px] uppercase tracking-[0.18em] text-white">
        {heroSlides[index].label}
      </span>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={stopped}
        aria-label={stopped ? 'Resume slideshow' : 'Pause slideshow'}
        className="ml-2 flex h-6 w-6 items-center justify-center text-white/80 transition-colors duration-300 hover:text-white"
      >
        {stopped ? (
          <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 fill-current">
            <path d="M2 1.5v9l8-4.5z" />
          </svg>
        ) : (
          <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 fill-current">
            <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
