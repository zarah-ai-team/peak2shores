'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'motion/react';
import type { HomeVisual } from '@/lib/data/home';

/**
 * A full-bleed still, with Marc's film over it when there is one. The film is
 * muted, loops, and plays only while it is on screen (and `active`, when the
 * caller hides it behind another layer); under reduced motion the still holds.
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
        alt={visual.video ? '' : visual.alt}
        fill
        sizes={sizes}
        priority={priority}
        className={className}
      />
      {visual.video && (
        <video
          ref={video}
          className={className}
          src={visual.video}
          poster={visual.img}
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
