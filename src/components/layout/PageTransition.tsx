'use client';

import * as m from 'motion/react-m';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
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
 * - Once the animation finishes the wrapper drops back to a plain element. A
 *   lingering transform or clip-path creates a containing block and quietly
 *   breaks `position: fixed` and the sticky itinerary rail inside a page.
 *
 * Reduced motion is honoured by `MotionConfig reducedMotion="user"`: the
 * transform is skipped and only the fade remains.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const firstRender = useRef(true);
  const [animatingFrom, setAnimatingFrom] = useState<string | null>(null);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setAnimatingFrom(pathname);
  }, [pathname]);

  if (animatingFrom !== pathname) {
    return <>{children}</>;
  }

  return (
    <m.div
      key={pathname}
      initial={{ opacity: 0, y: 16, clipPath: 'inset(2% 0% 0% 0%)' }}
      animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
      transition={{ duration: 0.72, ease: ease.editorial }}
      onAnimationComplete={() => setAnimatingFrom(null)}
    >
      {children}
    </m.div>
  );
}
