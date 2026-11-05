'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * The countries as a stack: each one holds its place while the next slides up
 * over it. A country taller than the screen scrolls through first and then
 * holds by its foot, so no journey card is ever hidden beneath the next one.
 * As a country is covered it dims, so the eye follows the one arriving.
 */
export function PlaceStack({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>(':scope > .dz-place'));
    if (!cards.length) return;

    let frame = 0;

    // Hold each card by its foot when it is taller than the screen.
    const place = () => {
      const vh = window.innerHeight;
      for (const card of cards) {
        card.style.top = `${Math.min(0, vh - card.offsetHeight)}px`;
      }
      cover();
    };

    // How far the next card has come over this one, 0 → 1.
    const cover = () => {
      frame = 0;
      const vh = window.innerHeight;
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        const amount = next
          ? Math.min(1, Math.max(0, (vh - next.getBoundingClientRect().top) / vh))
          : 0;
        card.style.setProperty('--cover', amount.toFixed(3));
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(cover);
    };

    const resize = new ResizeObserver(place);
    cards.forEach((card) => resize.observe(card));
    window.addEventListener('resize', place);
    window.addEventListener('scroll', onScroll, { passive: true });
    place();

    return () => {
      resize.disconnect();
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className="dz-stack">
      {children}
    </div>
  );
}
