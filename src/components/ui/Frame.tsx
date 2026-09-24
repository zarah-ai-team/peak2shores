'use client';

import Image from 'next/image';
import { useRef, type ReactNode, type RefObject } from 'react';
import * as m from 'motion/react-m';
import { useScroll, useTransform, type Variants } from 'motion/react';
import { getMedia, type MediaKey } from '@/lib/media';
import { ease, duration } from '@/lib/motion';
import { useMotionScale } from '@/components/motion/useMotionScale';

type FrameProps = {
  media: MediaKey;
  /** Above-the-fold frames load eagerly and skip the reveal. */
  priority?: boolean;
  /**
   * Fetch ahead of need but behind everything that matters — a carousel's
   * waiting slides. Implies no reveal.
   */
  warm?: boolean;
  /** next/image sizes hint. Always pass one — these are large photographs. */
  sizes?: string;
  /** contain is only for the cut-out portrait; everything else crops. */
  fit?: 'cover' | 'contain';
  /** Disable the mask reveal (heroes, and anything already in view). */
  reveal?: boolean;
  className?: string;
  /** Extra darkening for type laid over the frame. */
  overlay?: 'none' | 'hero' | 'caption';
  /** Inside a linked `.group`: the photograph eases in a few percent on hover. */
  hover?: boolean;
  /** Scroll-tied drift in px, each way. Tall half-bleed frames only; 0 is off. */
  parallax?: number;
  /** The hero's slow push-in. One frame at a time, never in a grid. */
  drift?: boolean;
  /**
   * The photograph repeats what the text beside it already says, or sits
   * inside a link whose name should be the title — so it gets an empty alt.
   */
  decorative?: boolean;
};

/**
 * The frame's observer lives on an ordinary, unclipped layer. Chrome measures
 * intersection and lazy-loading against what is actually visible, so a layer
 * hidden by a zero-area clip never counts as on screen: the reveal would never
 * fire and the photograph inside it would never even start to load. The
 * parent only relays the trigger; the children carry the movement.
 */
const triggerVariants: Variants = { hidden: {}, visible: {} };

/** A cover in the frame's own tone that lifts from the bottom edge. */
const curtainVariants: Variants = {
  hidden: { scaleY: 1 },
  visible: {
    scaleY: 0,
    transition: { duration: duration.signature, ease: ease.reveal },
  },
};

/** The picture settles from 1.04 → 1 behind the curtain. */
const settleVariants: Variants = {
  hidden: { scale: 1.04 },
  visible: { scale: 1, transition: { duration: 1.8, ease: ease.reveal } },
};

/**
 * The single image primitive.
 *
 * A frame is a tonal ground that either holds a photograph or, until one
 * exists, states the art direction for it. Photographs reveal as a cover in
 * the ground's tone lifts off them while they settle from 1.04 → 1, which
 * reads as the frame opening rather than the image sliding.
 *
 * Layers, outermost first: the trigger, then the settle, the optional
 * parallax (oversized so the drift never shows the ground), and the hover
 * zoom around the picture — with the curtain laid over all of it. One
 * viewport observer drives the curtain and the settle together; scroll
 * tracking exists only when a frame asks for parallax.
 */
export function Frame({
  media,
  priority = false,
  warm = false,
  sizes = '100vw',
  fit = 'cover',
  reveal = true,
  className = '',
  overlay = 'none',
  hover = false,
  parallax = 0,
  drift = false,
  decorative = false,
}: FrameProps) {
  const slot = getMedia(media);
  const ref = useRef<HTMLDivElement>(null);
  const animate = reveal && !priority && !warm;

  const picture = slot.src ? (
    <Image
      src={slot.src}
      alt={decorative ? '' : (slot.alt ?? slot.label)}
      fill
      sizes={sizes}
      priority={priority}
      loading={warm ? 'eager' : undefined}
      fetchPriority={warm ? 'low' : undefined}
      className={fit === 'contain' ? 'object-contain object-bottom' : 'object-cover'}
    />
  ) : (
    <Placeholder label={slot.label} brief={slot.brief} overlay={overlay} />
  );

  const layer = (
    <div className={`absolute inset-0 ${hover ? 'frame-zoom' : ''} ${drift ? 'hero-drift' : ''}`}>
      {picture}
    </div>
  );

  const body =
    parallax > 0 ? (
      <ParallaxLayer target={ref} distance={parallax}>
        {layer}
      </ParallaxLayer>
    ) : (
      layer
    );

  return (
    <div
      ref={ref}
      className={`relative isolate overflow-hidden ${className}`}
      style={{ backgroundColor: slot.tone }}
    >
      {animate ? (
        <m.div
          className="absolute inset-0"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={triggerVariants}
        >
          <m.div data-reveal className="absolute inset-0" variants={settleVariants}>
            {body}
          </m.div>
          <m.div
            aria-hidden
            data-curtain
            className="pointer-events-none absolute inset-0 origin-bottom"
            style={{ backgroundColor: slot.tone }}
            variants={curtainVariants}
          />
        </m.div>
      ) : (
        <div className="absolute inset-0">{body}</div>
      )}

      {overlay === 'hero' && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          // Deeper than the canvas' scrim on purpose. The canvas assumed a dark,
          // low-contrast hero; real photography is often bright, and the header
          // and headline have to stay legible over whatever is dropped in.
          style={{
            background: [
              // Vertical: protects the header at the top and the headline block
              // at the bottom.
              'linear-gradient(180deg, rgba(0,0,0,.46) 0%, rgba(0,0,0,.10) 30%, rgba(0,0,0,.12) 48%, rgba(0,0,0,.72) 100%)',
              // Horizontal: hero copy is flush left, so the left third carries a
              // little more weight. Falls off before the middle of the frame.
              'linear-gradient(90deg, rgba(0,0,0,.42) 0%, rgba(0,0,0,.14) 34%, rgba(0,0,0,0) 62%)',
            ].join(', '),
          }}
        />
      )}
      {overlay === 'caption' && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,.42) 100%)',
          }}
        />
      )}
    </div>
  );
}

/**
 * Scroll-tied drift. Only mounted when a frame asks for it, so the scroll
 * subscription and per-frame measurement exist for a handful of tall frames
 * per page rather than every photograph.
 *
 * The distance lives in a ref so the transformer always reads the current
 * value without the motion value being rebuilt when the viewport changes
 * class. Under reduced motion the stylesheet pins the layer in place.
 */
function ParallaxLayer({
  target,
  distance,
  children,
}: {
  target: RefObject<HTMLDivElement | null>;
  distance: number;
  children: ReactNode;
}) {
  const scale = useMotionScale();
  const px = Math.round(distance * scale);
  const pxRef = useRef(px);
  pxRef.current = px;

  const { scrollYProgress } = useScroll({ target, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, (p) => (p - 0.5) * 2 * pxRef.current);

  return (
    <m.div data-parallax className="absolute inset-x-0" style={{ top: -px, bottom: -px, y }}>
      {children}
    </m.div>
  );
}

/**
 * The drop zone. Deliberately the same treatment as the design canvas so the
 * unshot pages read as a brief, not as a broken image.
 */
function Placeholder({
  label,
  brief,
  overlay,
}: {
  label: string;
  brief: string;
  overlay: FrameProps['overlay'];
}) {
  // On a hero the copy sits low, so the brief goes high — clear of the header
  // above it and of the headline below.
  const position = overlay === 'hero' ? 'top-[22%] -translate-y-1/2' : 'top-1/2 -translate-y-1/2';

  return (
    <div className="absolute inset-0" role="img" aria-label={label}>
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,.06) 0%, rgba(0,0,0,.14) 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute inset-[1.9%] border"
        style={{ borderColor: 'rgba(255,255,255,.22)' }}
      />
      {/* Placed so the brief never collides with copy laid over the frame. */}
      <div
        aria-hidden
        className={`absolute inset-x-[8%] text-center text-white/90 ${position}`}
        style={{ fontFamily: 'ui-monospace, Menlo, monospace' }}
      >
        <div className="mb-2 text-[clamp(10px,1.05vw,16px)] uppercase leading-tight tracking-[0.18em]">
          {label}
        </div>
        <div className="text-[clamp(8px,0.8vw,12px)] uppercase tracking-[0.16em] text-white/60">
          {brief}
        </div>
      </div>
    </div>
  );
}
