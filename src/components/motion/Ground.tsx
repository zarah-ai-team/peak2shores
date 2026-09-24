'use client';

import { useInView } from 'motion/react';
import { createElement, useRef, type ReactNode } from 'react';

type GroundProps = {
  children: ReactNode;
  as?: 'section' | 'div';
  className?: string;
  id?: string;
  'aria-label'?: string;
};

/**
 * A dark section that develops from the page as it arrives.
 *
 * The element itself is ordinary — `bg-ink` and all — and stays that way with
 * no JavaScript. The ivory cover that fades away lives in CSS behind
 * `html[data-js] [data-ground]`, so this component only has to say when the
 * section has come into view.
 */
export function Ground({ children, as = 'section', className, id, ...rest }: GroundProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.12 });

  return createElement(
    as,
    {
      ref,
      id,
      className,
      'data-ground': '',
      'data-inview': inView ? '' : undefined,
      ...rest,
    },
    children,
  );
}
