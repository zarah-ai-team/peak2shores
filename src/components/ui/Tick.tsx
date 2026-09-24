'use client';

import * as m from 'motion/react-m';
import { type Variants } from 'motion/react';
import { ease } from '@/lib/motion';

const tickVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: { scaleX: 1, transition: { duration: 0.9, ease: ease.reveal, delay: 0.2 } },
};

/**
 * The gray-yellow tick. A 1px mark, never a fill.
 *
 * Inside a Reveal it draws itself from the left as the block arrives — the
 * variants are inherited from the nearest animated ancestor. Anywhere else
 * (the hero, the header) it is simply a rule. `data-reveal` lets the
 * stylesheet pin it drawn for reduced-motion and no-JavaScript readers.
 */
export function Tick({ className = '' }: { className?: string }) {
  return (
    <m.span
      aria-hidden
      data-reveal
      className={`inline-block h-px w-7 origin-left bg-gorse ${className}`}
      variants={tickVariants}
    />
  );
}
