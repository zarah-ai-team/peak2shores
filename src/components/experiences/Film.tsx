'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import { forScreen } from '@/components/home/HomeMedia';

export type FilmVisual = {
  /** The still, the frame the film opens on. */
  img: string;
  alt: string;
  /** Silent clip, played muted over the still. */
  video?: string;
};

/**
 * A still with its film over it. The still carries the alt text and is what a
 * crawler or a capture sees; the film is decoration — muted, looping, fetched
 * only when it first plays, and playing only while it is on screen and
 * `active`. Under reduced motion the still holds. The film has no poster: the
 * still beneath it shows through until its first frame is ready.
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
    if (!el || !visual.video) return;
    if (!el.getAttribute('src')) el.src = forScreen(visual.video);
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
  }, [active, reduced, visual.video]);

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
