'use client';

import { useSyncExternalStore } from 'react';

/**
 * The year in the footer's copyright line.
 *
 * The server prints the year in which it rendered the page. On a route that is
 * built once and served as a file, that year would stand until the next
 * deployment, so the visitor's own calendar takes over in the browser and the
 * line rolls over every 1 January on every page.
 *
 * `useSyncExternalStore` keeps the server's year through hydration and
 * re-renders once with the browser's, so the markup never mismatches. The
 * later of the two is shown: a device whose clock is set in the past cannot
 * turn the line back.
 */

// Nothing to listen to: a year does not turn while a page is being read.
const subscribe = () => () => {};

export function CopyrightYear({ built }: { built: number }) {
  const year = useSyncExternalStore(
    subscribe,
    () => Math.max(built, new Date().getFullYear()),
    () => built,
  );
  return <>{year}</>;
}
