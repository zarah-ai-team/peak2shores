'use client';

import { useEffect, useRef } from 'react';
import Image, { getImageProps } from 'next/image';
import { useReducedMotion } from 'motion/react';
import type { HomeVisual } from '@/lib/data/home';

/**
 * A film's poster: its still, through the image optimizer (WebP, about 1920px
 * wide), so the poster costs what the <Image> beneath it costs rather than the
 * original JPEG. The video shows it until the first frame is ready.
 */
export const posterOf = (src: string) =>
  getImageProps({ src, alt: '', width: 960, height: 540 }).props.src;

/**
 * The film to load on this screen: on a phone or small tablet, its 720px cut
 * (`name-m.mp4`, a fraction of the bytes and of the decoding), otherwise the
 * full one. Browser only; the server renders no film source.
 */
export const forScreen = (src: string) =>
  window.matchMedia('(max-width: 900px)').matches ? src.replace(/\.mp4$/, '-m.mp4') : src;

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
          poster={posterOf(visual.img)}
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

/**
 * A film on its own, with no still beneath: its first frame stands as the
 * poster (the `#t=` fragment with metadata preloaded), so nothing else shows
 * first. Muted, looping, playing only while on screen; under reduced motion
 * it holds on that first frame.
 */
export function Film({
  src,
  label,
  className = 'fill',
}: {
  src: string;
  label: string;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (!el.getAttribute('src')) el.src = `${forScreen(src)}#t=0.1`;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !reduced) el.play().catch(() => {});
      else el.pause();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced, src]);

  return (
    <video
      ref={video}
      className={className}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    />
  );
}

export function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d={dir === 'left' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
    </svg>
  );
}
