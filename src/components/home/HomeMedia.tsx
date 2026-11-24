'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import type { HomeVisual } from '@/lib/data/home';

/**
 * The film to load on this screen: on a phone or small tablet, its 720px cut
 * (`name-m.mp4`, a fraction of the bytes and of the decoding), otherwise the
 * full one. A phone held sideways counts as a phone however wide it is (a
 * 932px-wide one would otherwise take the 1920px cut); a short desktop window
 * keeps the full one. Browser only; the server renders no film source.
 */
export const forScreen = (src: string) =>
  window.matchMedia('(max-width: 900px), (max-height: 500px) and (pointer: coarse)').matches
    ? src.replace(/\.mp4$/, '-m.mp4')
    : src;

/**
 * A full-bleed still, with Marc's film over it when there is one. The film is
 * muted, loops, and plays only while it is on screen (and `active`, when the
 * caller hides it behind another layer); under reduced motion the still holds.
 * The film has no poster: the still beneath it is the same frame at the same
 * crop, and shows through until the first frame is ready (a poster was a
 * second, 1920px copy of it, fetched with the page whatever the screen).
 */
export function HomeMedia({
  visual,
  sizes,
  active = true,
  priority = false,
  className = 'fill',
}: {
  visual: HomeVisual;
  sizes: string;
  active?: boolean;
  priority?: boolean;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const visible = useRef(false);

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
        className={className}
        style={visual.pos ? { objectPosition: visual.pos } : undefined}
      />
      {visual.video && (
        <video
          ref={video}
          className={className}
          // The film crops where its still does, so the two never jump apart.
          style={visual.pos ? { objectPosition: visual.pos } : undefined}
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

export function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d={dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  );
}
