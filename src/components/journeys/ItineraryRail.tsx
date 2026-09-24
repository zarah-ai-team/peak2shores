'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type RailDay = { n: number; title: string };

/**
 * The itinerary's contents rail.
 *
 * An IntersectionObserver reports which day article is in the middle band of
 * the viewport; a single 1px acqua rule is then moved to that link's box with
 * a CSS transition. No layout-animation machinery — the marker is one element
 * whose transform and height are set from the link it should sit beside.
 */
export function ItineraryRail({ days }: { days: RailDay[] }) {
  const [activeDay, setActiveDay] = useState(days[0]?.n ?? 1);
  const navRef = useRef<HTMLElement>(null);
  const [marker, setMarker] = useState<{ y: number; h: number } | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveDay(Number(entry.target.id.replace('day-', '')));
          }
        });
      },
      { rootMargin: '-40% 0px -50% 0px' },
    );

    days.forEach((day) => {
      const element = document.getElementById(`day-${day.n}`);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [days]);

  // Measure the active link and place the marker beside it. Layout effect, so
  // the marker never paints a frame in the wrong place.
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const link = nav.querySelector<HTMLElement>(`[data-day="${activeDay}"]`);
    if (!link) return;
    // The nav is positioned, so it is the link's offsetParent: offsetTop is
    // already relative to it.
    setMarker({ y: link.offsetTop, h: link.offsetHeight });
  }, [activeDay]);

  return (
    <nav
      ref={navRef}
      aria-label="Itinerary"
      className="relative hidden flex-col border-t border-line lg:flex"
    >
      {marker && (
        <span
          aria-hidden
          className="rail-marker top-0"
          style={{ transform: `translateY(${marker.y}px)`, height: marker.h }}
        />
      )}
      {days.map((day) => {
        const active = day.n === activeDay;
        return (
          <a
            key={day.n}
            href={`#day-${day.n}`}
            data-day={day.n}
            aria-current={active ? 'location' : undefined}
            className="grid min-h-6 grid-cols-[36px_minmax(0,1fr)] gap-3 border-b border-line py-2.5 pl-3 font-ui text-[13px] font-light leading-[1.4] transition-colors duration-300 hover:text-acqua-text"
            style={{ color: active ? 'var(--color-ink)' : 'var(--color-muted)' }}
          >
            <span className="font-ui text-[10px] leading-[1.8] tracking-[0.16em]">
              {String(day.n).padStart(2, '0')}
            </span>
            <span>{day.title}</span>
          </a>
        );
      })}
    </nav>
  );
}
