'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';

/** What can take focus inside a dialog, for its Tab ring. */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/** On screen and not switched off, so Tab can reach it. */
const reachable = (el: HTMLElement) =>
  el.getClientRects().length > 0 &&
  getComputedStyle(el).visibility !== 'hidden' &&
  !el.closest('[inert]');

/** How long the panel takes to leave; the dialog closes when it has gone. */
const LEAVE_MS = 200;

/**
 * How many dialogs hold the page, and the root's own styles from before the
 * first of them. Every dialog shares the one count, so the page is let go only
 * when the last hold is: a dialog opened while another is still closing (the
 * browser's `close` event comes a moment after close()) neither loses a hold
 * nor lets the page go behind it.
 */
let holds = 0;
let before = { overflow: '', overscrollBehavior: '' };

/**
 * Holds the page still while a dialog is open, as the site menu does: the root
 * stops scrolling (the touch and keyboard scrolling of every browser) and the
 * smooth wheel scrolling of SmoothScroll is told to stop. Returns what lets the
 * page go again, which counts once however often it is called.
 */
function holdPage() {
  const root = document.documentElement;
  if (holds++ === 0) {
    before = { overflow: root.style.overflow, overscrollBehavior: root.style.overscrollBehavior };
    root.style.overflow = 'hidden';
    root.style.overscrollBehavior = 'none';
    window.dispatchEvent(new Event('p2s:scroll-lock'));
  }
  let held = true;
  return () => {
    if (!held) return;
    held = false;
    if (--holds > 0) return;
    root.style.overflow = before.overflow;
    root.style.overscrollBehavior = before.overscrollBehavior;
    window.dispatchEvent(new Event('p2s:scroll-unlock'));
  };
}

export type DialogProps = {
  open: boolean;
  /**
   * Asked to close: by the close button, Escape, a press on the dimmed page or
   * a phone's Back gesture. The owner sets `open` to false in answer.
   */
  onClose: () => void;
  /** The title at the top of the panel, which is also the dialog's name. */
  title: ReactNode;
  /** The id of an element inside the dialog that describes it; read out with its name. */
  describedBy?: string;
  /** Where focus goes as the dialog opens: the title when absent. */
  initialFocus?: RefObject<HTMLElement | null>;
  /** Where focus goes as it closes: the element that had focus before it opened when absent. */
  returnFocus?: RefObject<HTMLElement | null>;
  /** The close button's name for a screen reader. */
  closeLabel?: string;
  children: ReactNode;
};

/**
 * A modal dialog: an ivory panel over the page dimmed in navy, centred on a
 * tablet or a desktop and a full-height sheet on a phone. The title and a close
 * button stay at the top while the panel's body scrolls.
 *
 * It is the browser's own <dialog>, opened with `showModal()`, and placed at the
 * end of <body>, so no page style reaches it and it sits above the header and
 * the floating button. While it is open the page behind is inert and does not
 * scroll, Tab and Shift+Tab go round the dialog's controls only, and focus goes
 * back to the button that opened it when it closes.
 *
 * The panel rises and fades in, and fades out a little faster. For readers who
 * ask for reduced motion nothing moves: the site's stylesheet ends every
 * transition at once, so the dialog simply appears and goes.
 */
export function Dialog({
  open,
  onClose,
  title,
  describedBy,
  initialFocus,
  returnFocus,
  closeLabel = 'Close',
  children,
}: DialogProps) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const ref = useRef<HTMLDialogElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  /** Lets the page go; set while the dialog holds it. */
  const release = useRef<(() => void) | null>(null);
  /** The element that had focus before the dialog opened. */
  const opener = useRef<HTMLElement | null>(null);
  const leaving = useRef(0);
  // The latest props, for the handlers and the effects below, which run only
  // when the dialog opens or closes.
  const latest = useRef({ open, onClose, initialFocus, returnFocus });
  latest.current = { open, onClose, initialFocus, returnFocus };

  // The dialog is placed at the end of <body>, which exists only in the browser.
  useEffect(() => setHost(document.body), []);

  // Leaving the page with the dialog open: it closes at once and lets the page go.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    return () => {
      window.clearTimeout(leaving.current);
      if (dialog.open) dialog.close();
      release.current?.();
      release.current = null;
    };
  }, [host]);

  // Opening and closing. `data-state` drives the panel's transitions: `enter`
  // is the start of the way in, `open` its end, `leave` the way out.
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open) {
      window.clearTimeout(leaving.current);
      if (dialog.open) {
        // Asked to open again while it was leaving: it comes back.
        dialog.dataset.state = 'open';
        return;
      }
      const active = document.activeElement;
      opener.current = active instanceof HTMLElement && active !== document.body ? active : null;
      dialog.dataset.state = 'enter';
      dialog.showModal();
      // Opened again before the `close` event of its last closing came, it
      // keeps the hold it still has.
      release.current ??= holdPage();
      if (bodyRef.current) bodyRef.current.scrollTop = 0;
      (latest.current.initialFocus?.current ?? titleRef.current)?.focus({ preventScroll: true });
      // Two frames: the first paints the start of the way in, the second ends it.
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          dialog.dataset.state = 'open';
        });
      });
      return () => cancelAnimationFrame(frame);
    }
    if (!dialog.open || dialog.dataset.state === 'leave') return;
    dialog.dataset.state = 'leave';
    // With reduced motion the stylesheet ends every transition at once, so
    // there is nothing to wait for.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    leaving.current = window.setTimeout(() => dialog.close(), still ? 0 : LEAVE_MS);
  }, [open, host]);

  /** Closed, by the timer above or by the browser itself: the page is let go. */
  const onClosed = () => {
    const dialog = ref.current;
    // The browser sends `close` a moment after close(). When the dialog has
    // been opened again in that moment, the event is about the closing before:
    // the dialog stays open, holding the page.
    if (dialog?.open) return;
    window.clearTimeout(leaving.current);
    if (dialog) delete dialog.dataset.state;
    release.current?.();
    release.current = null;
    const back = latest.current.returnFocus?.current ?? opener.current;
    if (back?.isConnected) back.focus({ preventScroll: true });
    // The browser closes a dialog on its own when Escape is pressed again
    // while it is leaving; the owner is told, so its state follows.
    if (latest.current.open) latest.current.onClose();
  };

  /**
   * Tab and Shift+Tab go round the dialog's own controls. When focus rests on
   * something that is not a control (the title, a result's heading), they go
   * to the nearest control after or before it, and round from the ends.
   */
  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;
    const ring = [...event.currentTarget.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
      reachable,
    );
    if (ring.length === 0) return;
    const first = ring[0];
    const last = ring[ring.length - 1];
    const active = document.activeElement ?? document.body;
    const at = ring.indexOf(active as HTMLElement);
    let next: HTMLElement | undefined;
    if (at === -1) {
      next = event.shiftKey
        ? ring.findLast(
            (el) => active.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING,
          )
        : ring.find((el) => active.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
      next ??= event.shiftKey ? last : first;
    } else if (event.shiftKey && at === 0) next = last;
    else if (!event.shiftKey && at === ring.length - 1) next = first;
    if (!next) return;
    event.preventDefault();
    next.focus();
  };

  if (!host) return null;

  return createPortal(
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      // Wheel scrolling inside is the browser's own; SmoothScroll leaves it be.
      data-lenis-prevent
      onCancel={(event) => {
        // Escape, or a phone's Back gesture: the panel leaves before it closes.
        event.preventDefault();
        latest.current.onClose();
      }}
      onClose={onClosed}
      onKeyDown={onKeyDown}
      className="group/dialog fixed inset-0 m-0 h-full max-h-none w-full max-w-none overflow-hidden overscroll-contain border-0 bg-transparent p-0 text-ink backdrop:bg-transparent"
    >
      {/* The page, dimmed in see-through navy. A press on it closes. */}
      <div
        aria-hidden
        onClick={() => latest.current.onClose()}
        className="absolute inset-0 touch-none bg-[rgb(10_34_50/0.62)] opacity-0 transition-opacity duration-300 ease-editorial group-data-[state=leave]/dialog:duration-200 group-data-[state=open]/dialog:opacity-100"
      />
      <div className="pointer-events-none absolute inset-0 flex items-stretch justify-center sm:items-center sm:p-6">
        {/* Under forced colours (Windows high contrast) the dimmed page is not
            drawn, so the panel takes a 1px edge in the system's text colour. */}
        <div
          data-tone="light"
          className="pointer-events-auto relative flex h-full w-full translate-y-6 flex-col overflow-hidden bg-ivory opacity-0 shadow-[0_2rem_4rem_-1.5rem_rgb(10_34_50/0.5)] transition-[opacity,translate] duration-500 ease-reveal group-data-[state=leave]/dialog:duration-200 group-data-[state=leave]/dialog:ease-exit group-data-[state=open]/dialog:translate-y-0 group-data-[state=open]/dialog:opacity-100 motion-reduce:translate-y-0 forced-colors:border forced-colors:border-[color:CanvasText] sm:h-auto sm:max-h-full sm:w-[min(44rem,100%)] sm:rounded-[1.25rem]"
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line pt-[max(0.75rem,env(safe-area-inset-top))] pr-3 pb-3 pl-5 sm:pt-5 sm:pr-5 sm:pb-4 sm:pl-8">
            <h2 ref={titleRef} id={titleId} tabIndex={-1} className="h3 pt-2 outline-none">
              {title}
            </h2>
            <button
              type="button"
              onClick={() => latest.current.onClose()}
              aria-label={closeLabel}
              className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink transition-colors duration-200 hover:bg-panel"
            >
              <svg
                aria-hidden
                focusable="false"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M3.5 3.5l11 11M14.5 3.5l-11 11" />
              </svg>
            </button>
          </div>
          <div
            ref={bodyRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-8 sm:pt-7 sm:pb-8"
          >
            {children}
          </div>
        </div>
      </div>
    </dialog>,
    host,
  );
}
