'use client';

import { usePathname } from 'next/navigation';
import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { ease } from '@/lib/motion';

/**
 * The transition between pages.
 *
 * App Router swaps the tree as soon as the new route is ready, so an exit
 * animation on the outgoing page would either be skipped or would hold the
 * navigation back. Instead the incoming page arrives on its own: a soft rise
 * under a bottom mask, at magazine pace.
 *
 * Two deliberate constraints:
 *
 * - The very first page of a session is NOT animated. Server-rendered HTML
 *   should paint at full opacity — it keeps the largest contentful paint
 *   honest, and a page whose only route to being visible is a JavaScript
 *   animation is a page that disappears when the bundle fails.
 * - Nothing is left behind once it finishes. A lingering transform or
 *   clip-path creates a containing block and quietly breaks `position: fixed`
 *   and the sticky itinerary rail inside a page — so this is a Web Animation
 *   on a plain wrapper, which removes its effect when it ends.
 *
 * The wrapper is the same element on every render. Swapping it for an
 * animated one (and back) would make React discard and rebuild the whole page
 * twice per navigation: every reveal would replay, and the header would lose
 * track of the hero it measures.
 *
 * Under reduced motion the transform is skipped and only the fade remains.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Layout effect, so the new page never paints once at full opacity first.
  useLayoutEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const el = ref.current;
    if (!el || typeof el.animate !== 'function') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const animation = el.animate(
      reduced
        ? { opacity: [0, 1] }
        : {
            opacity: [0, 1],
            transform: ['translateY(16px)', 'none'],
            clipPath: ['inset(2% 0% 0% 0%)', 'inset(0% 0% 0% 0%)'],
          },
      { duration: 720, easing: `cubic-bezier(${ease.editorial.join(',')})` },
    );
    return () => animation.cancel();
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
