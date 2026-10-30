'use client';

import { useEffect, useRef, type RefObject } from 'react';

/** How far a press must travel before it counts as a drag, not a click. */
const SLOP = 6;

/** The scroller's items: its own children, or its list's. */
function itemsOf(el: HTMLElement): HTMLElement[] {
  const host = el.children.length > 1 ? el : (el.firstElementChild ?? el);
  return [...host.children] as HTMLElement[];
}

/** After a drag, the click that ends it opens nothing. */
function swallowNextClick(el: HTMLElement) {
  const stop = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  el.addEventListener('click', stop, { capture: true, once: true });
  // A drag that ends off the element fires no click; let the guard lapse.
  window.setTimeout(() => el.removeEventListener('click', stop, { capture: true }), 0);
}

/**
 * Lets a mouse drag a sideways scroller, as a finger already does. Touch and
 * pen are left to the browser. Snapping is held off while the hand is on it
 * (the `is-dragging` class, globals.css); let go, it glides to the nearest
 * card, leaning toward the way it was thrown.
 */
export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.drag = '';
    let id = -1;
    let startX = 0;
    let startLeft = 0;
    let moved = false;

    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      id = e.pointerId;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      moved = false;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      const dx = e.clientX - startX;
      if (!moved) {
        if (Math.abs(dx) < SLOP) return;
        moved = true;
        el.setPointerCapture(id);
        el.classList.add('is-dragging');
      }
      el.scrollLeft = startLeft - dx;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = -1;
      if (!moved) return;
      swallowNextClick(el);

      const items = itemsOf(el);
      const box = el.getBoundingClientRect();
      const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
      const lean = Math.sign(startLeft - el.scrollLeft) * (items[0]?.offsetWidth ?? 0) * -0.3;
      const aim = el.scrollLeft + lean;
      let target = el.scrollLeft;
      let best = Infinity;
      for (const item of items) {
        const at = item.getBoundingClientRect().left - box.left + el.scrollLeft - pad;
        if (Math.abs(at - aim) < best) {
          best = Math.abs(at - aim);
          target = at;
        }
      }
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollTo({ left: target, behavior: still ? 'auto' : 'smooth' });
      // Snapping back on once the glide has landed.
      const done = () => el.classList.remove('is-dragging');
      el.addEventListener('scrollend', done, { once: true });
      window.setTimeout(done, 900);
    };
    // Photographs and links are not dragged out of the page.
    const noNativeDrag = (e: DragEvent) => e.preventDefault();

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('dragstart', noNativeDrag);
    return () => {
      delete el.dataset.drag;
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
      el.removeEventListener('dragstart', noNativeDrag);
    };
  }, [ref]);
}

/**
 * A sideways swipe or mouse drag across a slider that moves one slide at a
 * time: past the threshold it calls `onSwipe(1)` for the next slide (dragged
 * leftward) or `onSwipe(-1)` for the previous. Vertical page scrolling on
 * touch is untouched (the element should have `touch-action: pan-y`).
 */
export function useSwipe(ref: RefObject<HTMLElement | null>, onSwipe: (dir: 1 | -1) => void) {
  const latest = useRef(onSwipe);
  latest.current = onSwipe;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.dataset.drag = '';
    let id = -1;
    let startX = 0;
    let startY = 0;

    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      // A press on a control stays a press on that control.
      if ((e.target as Element).closest('button')) return;
      id = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== id) return;
      id = -1;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > SLOP) swallowNextClick(el);
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      latest.current(dx < 0 ? 1 : -1);
    };
    const cancel = () => {
      id = -1;
    };
    const noNativeDrag = (e: DragEvent) => e.preventDefault();

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', cancel);
    el.addEventListener('dragstart', noNativeDrag);
    return () => {
      delete el.dataset.drag;
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancel);
      el.removeEventListener('dragstart', noNativeDrag);
    };
  }, [ref]);
}
