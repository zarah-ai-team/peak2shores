'use client';

import { useEffect, useRef, useState } from 'react';
import Image, { getImageProps } from 'next/image';
import { useReducedMotion } from 'motion/react';
import type { HomeVisual } from '@/lib/data/home';

/**
 * A film's poster: its still, 256px wide, a few kilobytes through the site's
 * own image loader (the 1920px stills once named here were dropped for their
 * weight; Lighthouse of 24 Nov then found none of the five homepage films
 * with a poster). A film stays transparent until it first plays (`shown`
 * below), so the sharp still beneath it is what the visitor sees meanwhile,
 * and the small poster is never drawn over it. Both callers name it only once
 * the page has loaded, so the posters stay out of the page's first bytes.
 */
export function posterOf(src: string): string {
  const { props } = getImageProps({ src, alt: '', width: 256, height: 144, quality: 85 });
  return props.srcSet?.split(', ')[0]?.split(' ')[0] ?? props.src;
}

/** A film's style until it first plays (transparent) and once it has (seen). */
export const shown = (played: boolean) => ({
  opacity: played ? 1 : 0,
  transition: 'opacity 0.4s ease',
});

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
 * The still beneath is the same frame at the same crop, and shows until the
 * film first plays; the film's poster is a small copy of it (posterOf).
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
  const [played, setPlayed] = useState(false);
  // The poster is named only once the page has loaded, so its few kilobytes
  // do not compete with the hero for the connection. It is never seen before
  // then: the film is transparent until it first plays.
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const arm = () => setArmed(true);
    if (document.readyState === 'complete') arm();
    else window.addEventListener('load', arm, { once: true });
    return () => window.removeEventListener('load', arm);
  }, []);

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
          style={{ ...(visual.pos ? { objectPosition: visual.pos } : {}), ...shown(played) }}
          poster={armed ? posterOf(visual.img) : undefined}
          onPlaying={() => setPlayed(true)}
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
