'use client';

import { Fragment } from 'react';
import * as m from 'motion/react-m';
import { ease, stagger as staggerDefaults } from '@/lib/motion';

export type RevealLine = { text: string };

type TextRevealProps = {
  lines: RevealLine[];
  className?: string;
  as?: 'h1' | 'h2' | 'p' | 'div';
  /** Seconds before the first line moves. */
  delay?: number;
  /** Play on mount (heroes) rather than waiting for the viewport. */
  immediate?: boolean;
};

/**
 * A masked line reveal for display type.
 *
 * Each line sits in its own overflow-hidden band and rises into it. Reserved
 * for headlines that carry a page — body copy stays still and readable.
 *
 * Heroes (`immediate`) animate in CSS, not JavaScript: that headline is the
 * page's largest contentful paint, and it must not wait on a bundle. Headlines
 * further down the page wait for the viewport, which does need JavaScript.
 *
 * Headlines are one style: no italic words inside them. The lines are joined
 * by real spaces, so copied text, search engines and screen readers get
 * "From the peaks of Switzerland", never "peaksof".
 *
 * The tree is the same for every reader. Reduced motion is handled by the
 * stylesheet (`.line-rise` is switched off; `[data-reveal]` is pinned to its
 * finished state), never by rendering different markup.
 */
export function TextReveal({
  lines,
  className = '',
  as: Tag = 'h2',
  delay = 0,
  immediate = false,
}: TextRevealProps) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => {
        const stagger = delay + i * staggerDefaults.lines;

        return (
          <Fragment key={i}>
            {i > 0 && ' '}
            <span className="block overflow-hidden pb-[0.06em]">
              {immediate ? (
                <span className="line-rise block" style={{ animationDelay: `${stagger}s` }}>
                  {line.text}
                </span>
              ) : (
                <m.span
                  data-reveal
                  className="block"
                  initial={{ y: '110%' }}
                  whileInView={{ y: '0%' }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 1.0, ease: ease.reveal, delay: stagger }}
                >
                  {line.text}
                </m.span>
              )}
            </span>
          </Fragment>
        );
      })}
    </Tag>
  );
}
