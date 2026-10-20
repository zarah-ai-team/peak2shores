'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as m from 'motion/react-m';
import { useReducedMotion, type MotionValue } from 'motion/react';
import { Frame } from '@/components/ui/Frame';

/* The reel is cut from Marc's own footage and photographs (public/video/).
   Phones get the 720p cut; everyone else the full one, WebM where the browser
   takes it. */
const sources = [
  { src: '/video/hero-reel-720.mp4', type: 'video/mp4', media: '(max-width: 767px)' },
  { src: '/video/hero-reel.webm', type: 'video/webm' },
  { src: '/video/hero-reel.mp4', type: 'video/mp4' },
];

const POSTER = '/video/hero-poster.jpg';

/**
 * State for the reel, kept in a hook so the video can sit behind the copy
 * while its control sits inside it.
 *
 * The reel plays muted and loops. Under `prefers-reduced-motion` it does
 * not start on its own (the poster stands in) but the control still plays
 * it; otherwise it stops for good when the reader presses pause. Either way it
 * rests while the hero is scrolled out of view — a video nobody is looking at
 * is wasted battery.
 */
export function useHeroReel() {
  const reduced = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  /** The reader's choice; 'auto' until they press the control. */
  const [choice, setChoice] = useState<'auto' | 'play' | 'pause'>('auto');
  const [visible, setVisible] = useState(true);

  const paused = choice === 'pause' || (choice === 'auto' && !!reduced);
  const playing = !paused && visible;

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (playing) {
      // Autoplay can still be refused (low-power mode); the poster then holds.
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [playing]);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggle = useCallback(() => setChoice(paused ? 'play' : 'pause'), [paused]);

  return { video, paused, autoPlay: !reduced, toggle };
}

/**
 * The film, full bleed behind the copy. A photograph sits underneath it, so
 * the hero is never an empty dark box — before the first frame arrives, or if
 * the files are missing altogether. The whole layer takes the page's scroll
 * at a fraction of its speed, like the photograph it replaced.
 */
export function HeroReel({
  video,
  autoPlay,
  y,
}: {
  video: React.RefObject<HTMLVideoElement | null>;
  autoPlay: boolean;
  y?: MotionValue<number>;
}) {
  return (
    <m.div className="absolute inset-0 -z-10" style={y ? { y } : undefined}>
      <Frame
        media="home-video-poster"
        priority
        reveal={false}
        decorative
        sizes="100vw"
        className="h-full"
      />
      <video
        ref={video}
        className="absolute inset-0 h-full w-full object-cover"
        poster={POSTER}
        autoPlay={autoPlay}
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        tabIndex={-1}
      >
        {sources.map((s) => (
          <source key={s.src} src={s.src} type={s.type} media={s.media} />
        ))}
      </video>
      {/* The hero scrim, as Frame draws it: the bottom protects the headline,
          the left the standfirst, the top the transparent header. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            'linear-gradient(to top, rgb(21 30 26 / 0.78), rgb(21 30 26 / 0) 62%)',
            'linear-gradient(to right, rgb(21 30 26 / 0.45), rgb(21 30 26 / 0) 55%)',
            'linear-gradient(to bottom, rgb(21 30 26 / 0.28), rgb(21 30 26 / 0) 22%)',
          ].join(', '),
        }}
      />
    </m.div>
  );
}

/** Bottom right: what the film is, and the pause control. */
export function HeroReelControls({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-4 pt-4">
      <span className="kicker-sm text-on-dark/80">Filmed by Marc · Switzerland &amp; beyond</span>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={paused}
        aria-label={paused ? 'Play the film' : 'Pause the film'}
        className="-mr-3 flex h-11 w-11 shrink-0 items-center justify-center text-on-dark/80 transition-colors duration-300 hover:text-on-dark"
      >
        {paused ? (
          <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 fill-current">
            <path d="M2 1.5v9l8-4.5z" />
          </svg>
        ) : (
          <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 fill-current">
            <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
