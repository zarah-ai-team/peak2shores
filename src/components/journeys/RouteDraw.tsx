'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Plays the route map's drawing once, as it scrolls into view.
 *
 * The map is rendered finished, and stays finished unless all of this holds:
 * motion is allowed, IntersectionObserver exists, and the map starts below
 * the fold. Only then is it armed (`data-route="armed"`: the route faint, the
 * places muted but still named) and, when it comes into view, drawn
 * (`data-route="drawing"`). journey.css holds both states. Without script,
 * under reduced motion, or for a capture that never scrolls, the finished
 * route is what shows.
 */
export function RouteDraw({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Already on screen (a reload partway down): nothing to wait for.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    el.dataset.route = 'armed';
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        el.dataset.route = 'drawing';
        io.disconnect();
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`route ${className ?? ''}`}>
      {children}
    </div>
  );
}
