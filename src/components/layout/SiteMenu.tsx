'use client';

import * as m from 'motion/react-m';
import { AnimatePresence, useIsPresent, useReducedMotion, type Variants } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type { SiteMenu as SiteMenuData } from '@/lib/content/types';
import { ease, menuTiming } from '@/lib/motion';
import type { MenuChapterId, NavItem } from '@/lib/site';
import { MenuDrill } from './menu/MenuDrill';
import { sectionOf, type Navigate } from './menu/MenuParts';
import { MenuTwoPane } from './menu/MenuTwoPane';
import './menu/menu.css';

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** The two-column layout needs the width for its columns and the height for its rows. */
const TWO_PANE = '(min-width: 1024px) and (min-height: 560px)';

/** In the Tab ring: on screen, not hidden, and not inside a part that is switched off. */
const reachable = (el: HTMLElement) =>
  el.getClientRects().length > 0 &&
  getComputedStyle(el).visibility !== 'hidden' &&
  !el.closest('[inert]');

/**
 * Puts focus on a part of the page that is not a control (the section a link
 * led to), so the next Tab goes on from there. It is made focusable only for
 * as long as it holds focus, and shows no ring for it (`[data-nav-target]` in
 * menu.css), as the page's own <main> does not.
 */
function land(target: HTMLElement) {
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
    target.setAttribute('data-nav-target', '');
    target.addEventListener(
      'blur',
      () => {
        target.removeAttribute('tabindex');
        target.removeAttribute('data-nav-target');
      },
      { once: true },
    );
  }
  target.focus({ preventScroll: true });
}

type SiteMenuProps = {
  open: boolean;
  onClose: () => void;
  /** The button that opened the menu; focus returns to it on close. */
  returnFocusTo: RefObject<HTMLElement | null>;
  /** The bar: its logo and the button stay in reach while the menu is open. */
  headerRef: RefObject<HTMLElement | null>;
  menu: SiteMenuData;
  cta: NavItem;
};

/**
 * The menu behind the three-line button, at every width.
 *
 * A sheet travels in from the right, under the bar. From 1024px it is a blue
 * sidebar holding the index (three sections, the other pages, the Plan
 * button) with a light panel beside it, already showing the journeys;
 * narrower (or in a window under 560px tall), the index comes first and a
 * section opens as a light pane of its own, with the way back under the
 * thumb. It leaves faster than it arrived, as one piece.
 *
 * It behaves as a dialog: while it is open the page behind is inert and does
 * not scroll, Tab stays within the bar and the sheet, Escape closes (or steps
 * back one level in the drill-down), and focus returns to the button, or goes
 * to the page when a link was followed. `aria-modal` is deliberately absent:
 * the control that closes the menu is in the bar, outside this element, and
 * must stay reachable to a screen reader; `inert` does the work instead.
 */
export function SiteMenu({ open, ...rest }: SiteMenuProps) {
  return <AnimatePresence>{open && <Surface key="site-menu" {...rest} />}</AnimatePresence>;
}

function Surface({ onClose, returnFocusTo, headerRef, menu, cta }: Omit<SiteMenuProps, 'open'>) {
  // False from the moment the menu is told to close, while it is still leaving.
  const present = useIsPresent();
  const reduced = useReducedMotion() ?? false;
  const pathname = usePathname() ?? '/';
  const panel = useRef<HTMLDivElement>(null);

  // Read here, not in the header: this component only ever renders in the
  // browser, so the server and the first client render stay the same.
  const [twoPane, setTwoPane] = useState(() => window.matchMedia(TWO_PANE).matches);
  /** True once the layout has changed under an open menu: nothing replays after that. */
  const [swapped, setSwapped] = useState(false);
  // The section the panel shows. On the wide layout one is always showing;
  // on the narrow one a section shows only once it has been opened.
  // It starts on the section the page being read belongs to (the one the
  // small square marks), and on the journeys everywhere else.
  const [chapter, setChapter] = useState<MenuChapterId>(() => sectionOf(pathname) ?? 'journeys');
  const [opened, setOpened] = useState(false);

  const closeReason = useRef<'dismiss' | 'navigate'>('dismiss');
  const pendingHash = useRef<string | null>(null);
  const state = useRef({ opened, twoPane });
  state.current = { opened, twoPane };

  const select = useCallback((id: MenuChapterId) => {
    setChapter(id);
    setOpened(true);
  }, []);
  const back = useCallback(() => setOpened(false), []);

  const dismiss = useCallback(() => {
    closeReason.current = 'dismiss';
    onClose();
  }, [onClose]);

  /**
   * Every link to a page of the site closes the menu (the phone and the
   * email leave the site and leave the menu as it is). A link to a
   * part of the page already open cannot rely on the router to scroll there:
   * the page is locked while the menu is up. So the address is changed here,
   * at once and without scrolling (Next keeps its router in step with
   * `history.pushState`), and once the lock is off the page is told the hash
   * has changed and is taken to the section.
   */
  const navigate = useCallback<Navigate>(
    (href, event) => {
      // A new tab or window: the menu stays as it is.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
        return;
      closeReason.current = 'navigate';
      const [path, hash] = href.split('#');
      if (hash && (path || '/') === pathname) {
        event.preventDefault();
        if (window.location.hash !== `#${hash}`) window.history.pushState(null, '', href);
        pendingHash.current = hash;
      }
      onClose();
    },
    [onClose, pathname],
  );

  // The layout follows the window; a rotation or a resize swaps it in place.
  useEffect(() => {
    const query = window.matchMedia(TWO_PANE);
    const onChange = () => {
      setTwoPane(query.matches);
      setSwapped(true);
    };
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // If the swap removed the control that had focus, the sheet takes it.
  useEffect(() => {
    if (!swapped) return;
    const active = document.activeElement;
    if (!active || active === document.body) panel.current?.focus({ preventScroll: true });
  }, [twoPane, swapped]);

  // The page behind does not scroll. The lock is on the root element alone
  // (never the body, which would become the scroll container of the bars a
  // page pins under the header) and the page never moves, so there is no
  // position to restore. Lifted the moment the menu is told to close.
  useEffect(() => {
    if (!present) return;
    const root = document.documentElement;
    root.setAttribute('data-nav-open', '');
    window.dispatchEvent(new Event('p2s:scroll-lock'));
    return () => {
      root.removeAttribute('data-nav-open');
      window.dispatchEvent(new Event('p2s:scroll-unlock'));
      // Read, not cleared: the focus effect below sends focus to the same section.
      const hash = pendingHash.current;
      if (hash)
        requestAnimationFrame(() => {
          // `pushState` raises no hashchange of its own, and parts of a page
          // listen for one (the Experiences panels open the one it names).
          window.dispatchEvent(new HashChangeEvent('hashchange'));
          window.dispatchEvent(new CustomEvent('p2s:scroll-to', { detail: hash }));
        });
    };
  }, [present]);

  // Nothing behind the sheet can take focus or be read. (Declared before the
  // focus effect: its cleanup must run first, so the page can take focus.)
  useEffect(() => {
    if (!present) return;
    const outside = document.querySelectorAll<HTMLElement>(
      'main, footer, a[href="#main"], .hc-fab',
    );
    outside.forEach((el) => {
      el.inert = true;
    });
    return () => {
      outside.forEach((el) => {
        el.inert = false;
      });
    };
  }, [present]);

  // Escape, the Tab ring, and where focus goes on the way in and out.
  useEffect(() => {
    if (!present) return;
    const opener = returnFocusTo.current;
    const bar = headerRef.current;
    // A sheet reopened while it was leaving after a link starts afresh: its
    // next close is a plain close unless another link is followed.
    closeReason.current = 'dismiss';

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        // On the narrow layout a section steps back to the index; a second
        // Escape closes. The wide layout has no level to step back from.
        if (!state.current.twoPane && state.current.opened) setOpened(false);
        else dismiss();
        return;
      }
      if (event.key !== 'Tab') return;

      // The ring is the bar (logo and button) followed by the sheet, in that
      // order in the page, so only its two ends need joining.
      const ring = [headerRef.current, panel.current]
        .flatMap((root) => (root ? [...root.querySelectorAll<HTMLElement>(FOCUSABLE)] : []))
        .filter(reachable);
      if (ring.length === 0) return;
      const first = ring[0];
      const last = ring[ring.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    panel.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      if (closeReason.current !== 'navigate') {
        // To the button that opened it, unless focus is already on the bar
        // (the logo was used): it is then where the reader put it.
        if (!bar?.contains(document.activeElement)) opener?.focus({ preventScroll: true });
        return;
      }
      // A link was followed: focus goes to the page, and to the section the
      // link named when it is a part of the page already open.
      const hash = pendingHash.current;
      pendingHash.current = null;
      const target = (hash && document.getElementById(hash)) || document.getElementById('main');
      if (target) land(target);
    };
  }, [present, dismiss, returnFocusTo, headerRef]);

  // The sheet's travel is a `transform` string, not Motion's `x`: Motion hands
  // a whole transform to the browser's own animation engine, which runs it off
  // the main thread and starts its clock at the first painted frame. `x` would
  // be written from JavaScript every frame, in the very moment the browser is
  // busy mounting the sheet, and most of a fast-starting curve would be lost.
  // Under reduced motion nothing travels: the sheet cross-fades in place.
  const sheet: Variants = reduced
    ? {
        closed: { opacity: 0, transition: { duration: menuTiming.fadeOut } },
        open: { opacity: 1, transition: { duration: menuTiming.fadeIn } },
      }
    : {
        closed: {
          transform: 'translateX(100%)',
          transition: { duration: menuTiming.sheetOut, ease: ease.exit },
        },
        open: {
          transform: 'translateX(0%)',
          transition: { duration: menuTiming.sheetIn, ease: ease.reveal },
        },
      };
  const scrim: Variants = {
    closed: {
      opacity: 0,
      transition: reduced
        ? { duration: menuTiming.fadeOut }
        : { duration: menuTiming.scrimOut, ease: ease.exit, delay: 0.06 },
    },
    open: {
      opacity: 1,
      transition: reduced
        ? { duration: menuTiming.fadeIn }
        : { duration: menuTiming.scrimIn, ease: ease.editorial },
    },
  };

  const shared = { menu, cta, chapter, onSelect: select, pathname, onNavigate: navigate };

  return (
    // The root clips the sheet while it travels, so a sheet half off the
    // screen never gives the page a sideways scroll.
    <m.div
      className="site-menu-root"
      initial="closed"
      animate="open"
      exit="closed"
      variants={{ closed: {}, open: {} }}
    >
      {/* A press on the dimmed page closes: at the press for the main mouse
          button (not a right or middle press), at the lift for a finger or a
          pen. A touch that closed at the press would leave nothing under the
          finger by the time it lifted, and its click would land on the page
          behind. The mouse press's own default is cancelled: it would take
          focus straight back off the menu button, which has just been given it. */}
      <m.div
        className="menu-scrim"
        aria-hidden
        variants={scrim}
        onPointerDown={(event) => {
          if (event.button === 0 && event.pointerType === 'mouse') dismiss();
        }}
        onClick={dismiss}
        onMouseDown={(event) => event.preventDefault()}
      />
      <m.div
        ref={panel}
        id="site-menu"
        role="dialog"
        aria-label="Menu"
        tabIndex={-1}
        data-tone="dark"
        data-layout={twoPane ? 'two' : 'drill'}
        className="site-menu"
        variants={sheet}
        inert={!present}
      >
        {/* The bar floats over this band, in the sidebar's blue at every width. */}
        <div className="menu-topband" aria-hidden />
        {twoPane ? (
          <MenuTwoPane {...shared} animate={!swapped} />
        ) : (
          <MenuDrill
            {...shared}
            opened={opened}
            onBack={back}
            reduced={reduced}
            animate={!swapped}
          />
        )}
      </m.div>
    </m.div>
  );
}
