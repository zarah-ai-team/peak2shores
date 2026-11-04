'use client';

import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

/** What slides in as it is scrolled to, for browsers without scroll-driven animation. */
const SLIDES = [
  'main section:not([data-hero]) > :not([aria-hidden="true"]):not([data-no-settle]):not(script):not(style)',
  'main .dz-place .dz-in > *',
  '.jx .grid > li',
  '.xpd-grid > li',
  '.dz-facts > li',
].join(',');

/**
 * Smooth, eased scrolling by wheel and trackpad (Lenis), with in-page links
 * landing clear of the header. Touch keeps the device's own scrolling. Off
 * entirely for readers who ask for reduced motion.
 *
 * Where the browser cannot tie animation to scroll position (the stylesheet's
 * slide-ins), blocks below the fold are marked to wait and slide in when they
 * arrive. Nothing is hidden unless this script has run and marked it.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const html = document.documentElement;
    const pad = parseFloat(getComputedStyle(html).scrollPaddingTop) || 0;
    const l = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 0.9,
      anchors: { offset: -pad },
      allowNestedScroll: true,
      autoRaf: true,
    });
    lenis.current = l;
    return () => {
      l.destroy();
      lenis.current = null;
    };
  }, []);

  // A new page starts still, with no glide carried over from the last one.
  useEffect(() => {
    const l = lenis.current;
    if (!l) return;
    l.stop();
    l.start();
  }, [pathname]);

  useEffect(() => {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      CSS.supports('animation-timeline: view()')
    )
      return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add('sl-in');
          io.unobserve(e.target);
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    const fold = window.innerHeight;
    document.querySelectorAll<HTMLElement>(SLIDES).forEach((el, i) => {
      if (el.getBoundingClientRect().top < fold) return;
      el.classList.add('sl-wait');
      el.style.setProperty('--sl-i', String(i % 3));
      io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
