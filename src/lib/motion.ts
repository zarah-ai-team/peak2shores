import type { Transition, Variants } from 'motion/react';
import type { CSSProperties } from 'react';

/**
 * The delay for a CSS `.enter` element — the page-load sequence in globals.css.
 * Usable from server components; it is only a custom property.
 */
export const enterAt = (seconds: number) => ({ '--enter-delay': `${seconds}s` }) as CSSProperties;

/**
 * One motion system for the whole site.
 *
 * The canvas set the tone: slow reveals, nothing bouncy. Interface feedback is
 * quick (200–400ms), editorial reveals are unhurried (600–1100ms), page
 * transitions sit between the two, and the signature moments run longest.
 *
 * Nothing here uses a spring — springs overshoot, and this brand does not.
 */

export const ease = {
  /** The house curve. Fast out of the gate, long settle. */
  editorial: [0.2, 0.6, 0.2, 1],
  /** Leaving the screen: the mirror of the above. */
  exit: [0.4, 0, 0.6, 1],
  /** For masks and clip reveals that should feel mechanical, not springy. */
  reveal: [0.16, 0.84, 0.24, 1],
} as const;

export const duration = {
  ui: 0.3,
  uiSlow: 0.45,
  reveal: 1.1,
  page: 0.7,
  signature: 1.4,
} as const;

const transitions = {
  ui: { duration: duration.ui, ease: ease.editorial },
  reveal: { duration: duration.reveal, ease: ease.editorial },
  page: { duration: duration.page, ease: ease.editorial },
  signature: { duration: duration.signature, ease: ease.reveal },
} satisfies Record<string, Transition>;

/**
 * Where a block arrives from. `up` is the house default; `left`/`right` are
 * for text that sits beside a photograph, so it reads as unfolding from the
 * picture rather than rising out of nowhere. `none` is a plain fade.
 */
export type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

/**
 * How it arrives. `fade` lifts and fades; `scale` adds a settle from 96% for
 * numbers and small set pieces; `mask` rises through a clipped band, the
 * treatment reserved for headlines.
 */
export type RevealVariant = 'fade' | 'scale' | 'mask';

function offsetFor(direction: RevealDirection, distance: number) {
  switch (direction) {
    case 'up':
      return { y: distance };
    case 'down':
      return { y: -distance };
    case 'left':
      return { x: -distance };
    case 'right':
      return { x: distance };
    default:
      return {};
  }
}

/** Build the hidden/visible pair for a block. */
export function makeReveal(
  direction: RevealDirection = 'up',
  variant: Exclude<RevealVariant, 'mask'> = 'fade',
  distance = 18,
): Variants {
  const offset = offsetFor(direction, distance);
  if (variant === 'scale') {
    return {
      hidden: { opacity: 0, scale: 0.96, ...offset },
      visible: { opacity: 1, scale: 1, x: 0, y: 0, transition: transitions.reveal },
    };
  }
  return {
    hidden: { opacity: 0, ...offset },
    visible: { opacity: 1, x: 0, y: 0, transition: transitions.reveal },
  };
}

/** The inner element of a masked headline: rises through the band. */
export const maskInnerVariants: Variants = {
  hidden: { y: '60%', opacity: 0 },
  visible: {
    y: '0%',
    opacity: 1,
    transition: { duration: 1.15, ease: ease.reveal },
  },
};

export function staggerParent(stagger = 0.08, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren },
    },
  };
}

/** The viewport rule every reveal shares, so nothing fires at a different moment. */
export const viewportOnce = { once: true, amount: 0.15, margin: '0px 0px -8% 0px' } as const;
