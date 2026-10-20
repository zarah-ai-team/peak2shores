'use client';

import { useCallback, useRef, useState } from 'react';
import { Frame } from '@/components/ui/Frame';
import type { HomeContent } from '@/lib/content';

type Content = HomeContent['peaksToShores'];

const clamp = (v: number) => Math.max(4, Math.min(96, v));

/**
 * The name as one picture you can travel across: the Alps on the left, the
 * sea on the right, and a handle between them. Drag it (or use the arrow
 * keys — it is a real slider) and each side's line fades up as its picture
 * takes the frame.
 *
 * The shores photograph lies on top, clipped from the left at the handle's
 * position. Without JavaScript the handle rests in the middle and both lines
 * read.
 */
export function PeaksShoresSlider({ content }: { content: Content }) {
  const [split, setSplit] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fromPointer = useCallback((clientX: number) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect) return;
    setSplit(clamp(((clientX - rect.left) / rect.width) * 100));
  }, []);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 4;
    const keys: Record<string, number> = {
      ArrowLeft: split - step,
      ArrowDown: split - step,
      ArrowRight: split + step,
      ArrowUp: split + step,
      Home: 4,
      End: 96,
    };
    if (event.key in keys) {
      event.preventDefault();
      setSplit(clamp(keys[event.key]));
    }
  };

  // Each line is fully up once its side has most of the frame.
  const peaksOpacity = Math.max(0.25, Math.min(1, (split - 20) / 30));
  const shoresOpacity = Math.max(0.25, Math.min(1, (80 - split) / 30));
  const [peaks, two, shores] = content.headlineParts;

  return (
    <div
      ref={box}
      className="relative h-[min(92svh,900px)] min-h-[560px] touch-pan-y select-none overflow-hidden bg-forest-deep text-on-dark"
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        fromPointer(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      <div className="absolute inset-0">
        <Frame media="home-peaks" decorative reveal={false} sizes="100vw" className="h-full" />
      </div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${split}%)` }}>
        <Frame media="home-shores" decorative reveal={false} sizes="100vw" className="h-full" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forest-deep/70 via-forest-deep/10 to-forest-deep/40"
      />

      {/* The two lines, each on its own side. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 grid grid-cols-2 gap-6 px-[var(--site-gutter)] pb-[clamp(32px,6vh,72px)]">
        <div style={{ opacity: peaksOpacity }} className="transition-opacity duration-300">
          <div className="h1">{peaks}</div>
          <p className="prose-body mt-4 hidden max-w-[34ch] text-on-dark md:block">
            {content.peaks}
          </p>
        </div>
        <div
          style={{ opacity: shoresOpacity }}
          className="text-right transition-opacity duration-300"
        >
          <div className="h1">{shores}</div>
          <p className="prose-body mt-4 ml-auto hidden max-w-[34ch] text-on-dark md:block">
            {content.shores}
          </p>
        </div>
      </div>

      {/* The handle. */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="Travel from the peaks to the shores"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(split)}
        aria-valuetext={split < 40 ? 'Shores' : split > 60 ? 'Peaks' : 'Between'}
        onKeyDown={onKeyDown}
        className="absolute inset-y-0 -ml-6 flex w-12 cursor-ew-resize items-center justify-center outline-none focus-visible:[&>span]:ring-2 focus-visible:[&>span]:ring-acqua"
        style={{ left: `${split}%` }}
      >
        <i aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-on-dark/80" />
        <span className="relative flex h-14 w-14 items-center justify-center rounded-full border border-on-dark/80 bg-forest-deep/40 backdrop-blur-sm">
          <span aria-hidden className="h5 leading-none text-acqua">
            {two.replace('.', '')}
          </span>
        </span>
      </div>
    </div>
  );
}
