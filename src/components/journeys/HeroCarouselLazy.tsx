'use client';

import { useEffect, useState, type ComponentProps } from 'react';
import type { HeroCarousel } from './HeroCarousel';

type Carousel = typeof HeroCarousel;

/*
 * The globe's code (HeroCarousel, with d3-geo and topojson-client) is a chunk
 * of its own, fetched only when the Map view is wanted rather than with the
 * Journeys page, where the Map view starts closed (page-speed pass of 27 Nov
 * 2026). Pointing at or focusing the Cards / Map switch starts the fetch
 * (JourneyCollection), so the code is usually here by the time Map is
 * pressed; opening the view starts it otherwise. Fetched once, then kept.
 */
let loaded: Carousel | null = null;
let loading: Promise<Carousel> | null = null;

function loadHeroCarousel(): Promise<Carousel> {
  loading ??= import('./HeroCarousel').then(
    (m) => (loaded = m.HeroCarousel),
    (error: unknown) => {
      // A fetch that failed (the connection dropped) is tried again next time.
      loading = null;
      throw error;
    },
  );
  return loading;
}

/** Starts fetching the globe's code, if it has not started. */
export function preloadHeroCarousel() {
  loadHeroCarousel().catch(() => {});
}

/**
 * Fetches the globe's code once the page has loaded and the browser is idle,
 * so a tap on Map (where pointing at the switch first is not possible) finds
 * it here: still outside the page's first load, which is what is measured.
 */
export function useIdleHeroCarousel() {
  useEffect(() => {
    let idle = 0;
    let timer = 0;
    const start = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idle = window.requestIdleCallback(preloadHeroCarousel, { timeout: 4000 });
      } else {
        timer = window.setTimeout(preloadHeroCarousel, 1500);
      }
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      if (idle) window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, []);
}

/**
 * The Map view's globe and carousel (JourneysMap), mounted once the view is
 * first opened (JourneyCollection). With the code already here, the carousel
 * draws in the same render, as it did when it came with the page. Otherwise
 * the globe's own frame (`.jxh-map`: the same size, border and paper as the
 * globe's before its earth is painted) holds the place until the code arrives.
 *
 * Not next/dynamic: its Suspense boundary would show the placeholder on every
 * first opening, even with the code already loaded, and React keeps a
 * Suspense fallback on screen for at least 300 ms once it is shown.
 */
export function HeroCarouselLazy(props: ComponentProps<Carousel>) {
  const [Loaded, setLoaded] = useState(() => loaded);

  useEffect(() => {
    if (Loaded) return;
    let live = true;
    loadHeroCarousel().then(
      (carousel) => {
        if (live) setLoaded(() => carousel);
      },
      () => {},
    );
    return () => {
      live = false;
    };
  }, [Loaded]);

  return Loaded ? <Loaded {...props} /> : <div className="jxh-map" aria-hidden />;
}
