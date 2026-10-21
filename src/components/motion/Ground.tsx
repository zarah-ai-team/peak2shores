'use client';

import { useInView } from 'motion/react';
import { createElement, useRef, type CSSProperties, type ReactNode } from 'react';

type GroundProps = {
  children: ReactNode;
  as?: 'section' | 'div' | 'aside' | 'footer' | 'article';
  className?: string;
  style?: CSSProperties;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  /** Lets children pick their dark variants through CSS. Section sets it. */
  'data-tone'?: 'dark' | 'light' | 'stone';
};

/**
 * A dark section that develops from the page as it arrives.
 *
 * The element itself is ordinary — `bg-forest` and all — and stays that way
 * with no JavaScript. The ivory cover that fades away lives in CSS behind
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
