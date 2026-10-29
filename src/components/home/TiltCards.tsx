'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const VARS = ['--rx', '--ry', '--sx', '--gx', '--gy'] as const;

/**
 * The pillars' list. Under a mouse each card tilts toward the pointer as it
 * moves across it: the stylesheet reads --rx and --ry (the tilt; the part of
 * the card under the pointer comes forward), --sx (the shadow's lean) and
 * --gx/--gy (where the light falls on the photograph). Without a mouse, or
 * under reduced motion, nothing is set and the stylesheet's fixed tilt applies.
 */
export function TiltCards({ className, children }: { className?: string; children: ReactNode }) {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');

    const cleanups = [...el.querySelectorAll<HTMLElement>('.card')].map((card) => {
      // Measured as the pointer arrives, before the card has turned.
      let box: DOMRect | null = null;
      let photo: DOMRect | null = null;
      let frame = 0;

      const measure = () => {
        box = card.getBoundingClientRect();
        photo = card.querySelector('.ph')?.getBoundingClientRect() ?? null;
      };
      const move = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse' || !fine.matches || still.matches) return;
        if (!box) measure();
        const { clientX, clientY } = e;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (!box) return;
          const x = (clientX - box.left) / box.width - 0.5;
          const y = (clientY - box.top) / box.height - 0.5;
          card.style.setProperty('--rx', `${(y * 14).toFixed(2)}deg`);
          card.style.setProperty('--ry', `${(-x * 14).toFixed(2)}deg`);
          card.style.setProperty('--sx', `${(x * 40).toFixed(1)}px`);
          if (photo) {
            const gx = ((clientX - photo.left) / photo.width) * 100;
            const gy = ((clientY - photo.top) / photo.height) * 100;
            card.style.setProperty('--gx', `${gx.toFixed(1)}%`);
            card.style.setProperty('--gy', `${gy.toFixed(1)}%`);
          }
        });
      };
      const leave = () => {
        cancelAnimationFrame(frame);
        box = photo = null;
        VARS.forEach((v) => card.style.removeProperty(v));
      };

      card.addEventListener('pointerenter', measure);
      card.addEventListener('pointermove', move);
      card.addEventListener('pointerleave', leave);
      return () => {
        cancelAnimationFrame(frame);
        card.removeEventListener('pointerenter', measure);
        card.removeEventListener('pointermove', move);
        card.removeEventListener('pointerleave', leave);
      };
    });
    return () => cleanups.forEach((off) => off());
  }, []);

  return (
    <ol ref={list} className={className}>
      {children}
    </ol>
  );
}
