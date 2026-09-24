'use client';

import { useSyncExternalStore } from 'react';

/**
 * How far things may travel on this screen.
 *
 * 1 on a desktop; 0.45 on a phone, where a parallax distance that reads as
 * depth on a 27-inch display reads as a wobble. Multiply any scroll-tied
 * distance by it.
 *
 * One `matchMedia` for the whole page, shared through `useSyncExternalStore`,
 * rather than a listener per caller. The server snapshot is 1; React keeps
 * that value through hydration and re-renders once with the real one, so the
 * markup never mismatches.
 */

const QUERY = '(max-width: 767px)';

let list: MediaQueryList | null = null;

function mql() {
  list ??= window.matchMedia(QUERY);
  return list;
}

function subscribe(onChange: () => void) {
  const m = mql();
  m.addEventListener('change', onChange);
  return () => m.removeEventListener('change', onChange);
}

const getSnapshot = () => (mql().matches ? 0.45 : 1);
const getServerSnapshot = () => 1;

export function useMotionScale() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
