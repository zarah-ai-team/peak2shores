'use client';

import { useEffect, useRef } from 'react';

/**
 * A 2px acqua rule across the very top that fills as the page is read.
 *
 * It sits above the header, so it reads as a property of the page rather than
 * of the navigation, and it is `aria-hidden` — scroll position is already
 * conveyed by the scrollbar, and announcing it again is noise.
 *
 * Written against the scroll event directly rather than through the animation
 * library: this is an indicator, not an animation. It should track the
 * scrollbar exactly. Bursts of scroll events are coalesced into one write per
 * frame; the easing is a CSS transition the compositor handles on its own.
 */
export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      el.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-acqua"
      style={{ transform: 'scaleX(0)', transition: 'transform 120ms linear' }}
    />
  );
}
