'use client';

import { useEffect, useRef } from 'react';
import Image, { getImageProps } from 'next/image';
import { useReducedMotion } from 'motion/react';

export type FilmVisual = {
  /** The still, and the film's poster. */
  img: string;
  alt: string;
  /** Silent clip, played muted over the still. */
  video?: string;
};

/** The poster through the image optimizer, so it costs what the still costs. */
const posterOf = (src: string) =>
  getImageProps({ src, alt: '', width: 960, height: 540 }).props.src;

/**
 * A still with its film over it. The still carries the alt text and is what a
 * crawler or a capture sees; the film is decoration — muted, looping, fetched
 * only when it first plays, and playing only while it is on screen and
 * `active`. Under reduced motion the still holds.
 */
export function Film({
  visual,
  sizes,
  active = true,
  priority = false,
  className = 'fill',
}: {
  visual: FilmVisual;
  sizes: string;
  active?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const visible = useRef(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const sync = () => {
      if (visible.current && active && !reduced) el.play().catch(() => {});
      else el.pause();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      sync();
    });
    observer.observe(el);
    sync();
    return () => observer.disconnect();
  }, [active, reduced]);

  return (
    <>
      <Image
        src={visual.img}
        alt={visual.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`${className} photo-grade`}
      />
      {visual.video && (
        <video
          ref={video}
          className={`${className} photo-grade`}
          poster={posterOf(visual.img)}
          src={visual.video}
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
          tabIndex={-1}
        />
      )}
    </>
  );
}
