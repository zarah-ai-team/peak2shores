'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * A section of a way's page, set in motion (way.css draws every state):
 *
 * - Arriving: once part of it is on screen the section is marked `in`, and
 *   its photographs open from their outer edge, settling from a slight zoom,
 *   while its words and cards rise in one after another.
 * - Scrolling past: `--wy-drift` runs from -1 as the section enters at the
 *   foot of the screen to 1 as it leaves at the top, for the photographs to
 *   drift against the page (wide screens only).
 *
 * Nothing is hidden until the script has run and found the section still
 * below the fold, so without JavaScript, for a reader who asks for less
 * motion, or on a visit that lands lower down, everything is simply there.
 */
export function WayReveal({
  className,
  labelledBy,
  label,
  children,
}: {
  className: string;
  labelledBy?: string;
  label?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Already in view (a reload further down, a link to the section): no entrance.
    el.dataset.anim = el.getBoundingClientRect().top < window.innerHeight * 0.85 ? 'in' : 'wait';
    const seen = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.dataset.anim = 'in';
        seen.disconnect();
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    if (el.dataset.anim === 'wait') seen.observe(el);

    const wide = window.matchMedia('(min-width: 1100px)');
    let frame = 0;
    const drift = () => {
      frame = 0;
      if (!wide.matches) {
        el.style.removeProperty('--wy-drift');
        return;
      }
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      const t = ((vh - r.top) / (vh + r.height)) * 2 - 1;
      el.style.setProperty('--wy-drift', Math.max(-1, Math.min(1, t)).toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(drift);
    };
    drift();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      seen.disconnect();
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <section ref={ref} className={className} aria-labelledby={labelledBy} aria-label={label}>
      {children}
    </section>
  );
}
