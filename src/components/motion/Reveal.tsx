'use client';

import * as m from 'motion/react-m';
import { type TargetAndTransition, type Variants } from 'motion/react';
import type { ReactNode } from 'react';
import {
  makeReveal,
  maskInnerVariants,
  staggerParent,
  viewportOnce,
  type RevealDirection,
  type RevealVariant,
} from '@/lib/motion';

type Tag = 'div' | 'section' | 'article' | 'ul' | 'ol' | 'li' | 'p' | 'blockquote' | 'footer';

type RevealProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Delay in seconds, for the rare case a block should follow another. */
  delay?: number;
  as?: Tag;
  /** Where the block arrives from. Text beside a photograph unfolds from it. */
  direction?: RevealDirection;
  /** `mask` is for headlines; `scale` for numbers and small set pieces. */
  variant?: RevealVariant;
  /** Travel in px. Kept short — this is a settle, not a slide. */
  distance?: number;
  /** How much of the block must be on screen before it moves. */
  amount?: number;
};

function withDelay(variants: Variants, delay: number): Variants {
  if (!delay) return variants;
  const visible = variants.visible as TargetAndTransition;
  return {
    ...variants,
    visible: { ...visible, transition: { ...(visible.transition ?? {}), delay } },
  };
}

/** The masked band a headline rises through. Descenders get a little room. */
const maskBand = 'overflow-hidden pb-[0.12em] -mb-[0.12em]';

/**
 * The value of `data-reveal`. A block that arrives from the side starts a few
 * pixels outside its box; on a narrow screen, where that block spans the
 * viewport, those pixels would widen the page. The stylesheet pins `x`
 * reveals below the side-by-side breakpoint so they fade instead.
 */
const axisOf = (direction: RevealDirection) =>
  direction === 'left' || direction === 'right' ? 'x' : 'y';

/*
 * None of these components look at the reduced-motion preference. The tree
 * is identical for every reader; `MotionConfig reducedMotion="user"` collapses
 * the movement, and the `[data-reveal]` rules in globals.css hand readers
 * with reduced motion — and readers without JavaScript — the finished state
 * over the top of whatever Motion serialised into the HTML.
 */

/** A block that lifts and fades in once, the first time it is scrolled to. */
export function Reveal({
  children,
  className = '',
  id,
  delay = 0,
  as = 'div',
  direction = 'up',
  variant = 'fade',
  distance = 18,
  amount,
}: RevealProps) {
  const Component = m[as];
  const viewport = amount === undefined ? viewportOnce : { ...viewportOnce, amount };

  if (variant === 'mask') {
    return (
      <Component
        data-reveal
        className={`${maskBand} ${className}`}
        id={id}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        variants={staggerParent(0, delay)}
      >
        <m.div variants={maskInnerVariants}>{children}</m.div>
      </Component>
    );
  }

  return (
    <Component
      data-reveal={axisOf(direction)}
      className={className}
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={withDelay(makeReveal(direction, variant, distance), delay)}
    >
      {children}
    </Component>
  );
}

/** Parent for a list whose items should arrive one after another. */
export function RevealGroup({
  children,
  className,
  id,
  stagger = 0.08,
  delay = 0,
  as = 'div',
  amount,
}: Pick<RevealProps, 'children' | 'className' | 'id' | 'delay' | 'as' | 'amount'> & {
  stagger?: number;
}) {
  const Component = m[as];
  const viewport = amount === undefined ? viewportOnce : { ...viewportOnce, amount };

  return (
    <Component
      className={className}
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={staggerParent(stagger, delay)}
    >
      {children}
    </Component>
  );
}

/** A child of RevealGroup. Inherits the parent's stagger timing. */
export function RevealItem({
  children,
  className,
  id,
  as = 'div',
  direction = 'up',
  variant = 'fade',
  distance = 18,
}: Omit<RevealProps, 'delay' | 'amount'>) {
  const Component = m[as];

  if (variant === 'mask') {
    return (
      <Component
        data-reveal
        className={`${maskBand} ${className ?? ''}`}
        id={id}
        variants={staggerParent(0)}
      >
        <m.div variants={maskInnerVariants}>{children}</m.div>
      </Component>
    );
  }

  return (
    <Component
      data-reveal={axisOf(direction)}
      className={className}
      id={id}
      variants={makeReveal(direction, variant, distance)}
    >
      {children}
    </Component>
  );
}
