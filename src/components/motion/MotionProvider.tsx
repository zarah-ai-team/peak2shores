'use client';

import { LazyMotion, MotionConfig, domAnimation } from 'motion/react';
import type { ReactNode } from 'react';

/**
 * One motion runtime for the whole tree.
 *
 * `LazyMotion` with `domAnimation` loads animations, variants, exit
 * animations and viewport triggers — everything this site uses — and leaves
 * out the drag and layout-projection systems that the default `motion`
 * proxy would ship. Every animated element in the codebase is an `m.*`
 * component; `strict` throws in development if a bare `motion.*` sneaks in
 * and silently drags the full bundle back.
 *
 * `reducedMotion="user"` makes Motion honour `prefers-reduced-motion`
 * globally: transform animations become instant and only opacity may still
 * cross-fade. The stylesheet's `[data-reveal]` rules then hand those readers
 * the finished state outright. Markup never branches on the preference, so
 * server and client always render the same tree.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
