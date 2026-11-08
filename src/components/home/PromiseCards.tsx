'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export type PromiseItem = { title: string; line: string; icon: ReactNode };

/**
 * The three promises every group journey shares, as three white cards with a
 * blue accent (8 Nov). On a desktop they sit in a row and rise in turn as the
 * section comes into view; on a phone they become a swipeable row that snaps
 * card by card, the next one peeking in, with dots that follow the swipe and
 * take you to a card when tapped.
 */
export function PromiseCards({ items }: { items: PromiseItem[] }) {
  const rail = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState(false);

  // Rise in once, the first time the cards come on screen.
  useEffect(() => {
    const el = rail.current;
    if (!el || !('IntersectionObserver' in window)) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        io.disconnect();
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // On a phone, the card nearest the start of the row is the current one.
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const onScroll = () => {
      const cards = [...el.children] as HTMLElement[];
      const left = el.getBoundingClientRect().left;
      let best = 0;
      let dist = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.getBoundingClientRect().left - left);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setActive(best);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (i: number) => {
    const el = rail.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: still ? 'auto' : 'smooth' });
  };

  return (
    <div className={`pc${seen ? ' in' : ''}`}>
      <ol ref={rail} className="pc-rail" aria-label="What every journey shares">
        {items.map((p, i) => (
          <li
            key={p.title}
            className={`pc-card${i === active ? ' on' : ''}`}
            style={{ '--i': i } as React.CSSProperties}
          >
            <div className="pc-top">
              <span className="pc-ico" aria-hidden>
                {p.icon}
              </span>
              <h3>{p.title}</h3>
            </div>
            <p>{p.line}</p>
          </li>
        ))}
      </ol>
      <div className="pc-dots" role="group" aria-label="Choose a promise">
        {items.map((p, i) => (
          <button
            key={p.title}
            type="button"
            className={i === active ? 'on' : undefined}
            aria-label={`Show ${p.title}`}
            aria-current={i === active}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
}
