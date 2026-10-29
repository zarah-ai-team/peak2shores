'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * The current item of a set that moves on by itself: the active item's
 * progress line runs (a CSS animation) while the set is on screen and not
 * held, and its end moves to the next. Pointing at, focusing or tapping an
 * item holds the set on it. Under reduced motion the line has no animation,
 * so nothing ever advances on its own.
 */
export function useAdvance<T extends HTMLElement>(count: number, slugs?: string[]) {
  const ref = useRef<T>(null);
  const [current, setCurrent] = useState(0);
  const [inView, setInView] = useState(false);
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // An anchor from elsewhere (the homepage index, the hero) opens on its item.
  useEffect(() => {
    if (!slugs) return;
    const open = () => {
      const i = slugs.indexOf(window.location.hash.slice(1));
      if (i >= 0) setCurrent(i);
    };
    open();
    window.addEventListener('hashchange', open);
    return () => window.removeEventListener('hashchange', open);
    // The slugs come from static content; one subscription is enough.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    ref,
    current,
    running: inView && !held,
    select: (i: number) => setCurrent(i),
    next: () => setCurrent((i) => (i + 1) % count),
    hold: () => setHeld(true),
    release: () => setHeld(false),
  };
}
