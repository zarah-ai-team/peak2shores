'use client';

import * as m from 'motion/react-m';
import { AnimatePresence, useIsPresent } from 'motion/react';
import { useEffect, useRef, type ReactNode } from 'react';
import type { SiteMenu as SiteMenuData } from '@/lib/content/types';
import { ease, menuTiming } from '@/lib/motion';
import { menuChapters, menuNav, type MenuChapterId, type NavItem } from '@/lib/site';
import {
  at,
  ChapterContent,
  Chevron,
  ContactLines,
  moveFocus,
  PagesList,
  PlanButton,
  sectionOf,
  type Navigate,
} from './MenuParts';

type MenuDrillProps = {
  menu: SiteMenuData;
  cta: NavItem;
  /** The section last chosen; it is showing only while `opened` is true. */
  chapter: MenuChapterId;
  opened: boolean;
  onSelect: (id: MenuChapterId) => void;
  onBack: () => void;
  /** False when the layout was swapped in by a resize: nothing replays. */
  animate: boolean;
  reduced: boolean;
  pathname: string;
  onNavigate: Navigate;
};

/** The arrow that points back, nudged left under the pointer as the forward one is nudged right. */
function BackArrow() {
  return (
    <svg
      aria-hidden
      focusable="false"
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className="btn-arrow btn-arrow--back"
    >
      <path d="M14 5H1M5 1L1 5l4 4" />
    </svg>
  );
}

/**
 * A section opened from the index: a light pane that slides in over it and,
 * on the way out, stops answering the keyboard and the pointer at once (a
 * pane that is leaving must not hold focus).
 */
function SubPane({
  id,
  animate,
  reduced,
  onBack,
  children,
}: {
  id: MenuChapterId;
  animate: boolean;
  reduced: boolean;
  onBack: () => void;
  children: ReactNode;
}) {
  const present = useIsPresent();
  // A whole `transform`, so the browser runs it off the main thread (see
  // SiteMenu). The pane travels its full width and is opaque all the way: a
  // pane that faded in over the index would show the index's words through it.
  const away = reduced ? { opacity: 0 } : { transform: 'translateX(100%)' };
  return (
    <m.section
      id={`menu-sub-${id}`}
      aria-labelledby={`menu-sub-${id}-title`}
      tabIndex={-1}
      className="menu-pane menu-sub-pane menu-scroller"
      data-tone="light"
      data-lenis-prevent
      inert={!present}
      initial={animate ? away : false}
      animate={
        reduced
          ? { opacity: 1, transition: { duration: menuTiming.fadeOut } }
          : {
              transform: 'translateX(0%)',
              transition: { duration: menuTiming.paneIn, ease: ease.reveal },
            }
      }
      exit={{
        ...away,
        transition: reduced
          ? { duration: menuTiming.fadeOut }
          : { duration: menuTiming.paneOut, ease: ease.exit },
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          onBack();
        } else if (moveFocus(event.currentTarget, event.key)) event.preventDefault();
      }}
    >
      {children}
    </m.section>
  );
}

/**
 * The narrow layout, one pane at a time. The first is the index in blue: the
 * three sections as large entries, then the other pages. A section opens as a
 * light pane of its own; the way back and "Plan your journey" stay in the
 * foot, under the thumb.
 */
export function MenuDrill({
  menu,
  cta,
  chapter,
  opened,
  onSelect,
  onBack,
  animate,
  reduced,
  pathname,
  onNavigate,
}: MenuDrillProps) {
  const sub = opened ? chapter : null;
  const here = sectionOf(pathname);
  const last = useRef<MenuChapterId | null>(null);
  const mounted = useRef(false);
  const body = useRef<HTMLDivElement>(null);

  // Focus follows the level: onto the section on the way in (it is named by
  // its title, and the first Tab from it reaches the way back), and back to
  // the entry that opened it on the way out. Not on mount: the sheet itself
  // takes focus as it opens.
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      last.current = sub;
      return;
    }
    if (sub) {
      last.current = sub;
      // In a window only a few lines tall the whole layout scrolls as one
      // (menu.css); a section then starts at its top, not where the index
      // was left. Elsewhere this box does not scroll and nothing moves.
      body.current?.scrollTo(0, 0);
      document.getElementById(`menu-sub-${sub}`)?.focus({ preventScroll: true });
    } else if (last.current) {
      document.getElementById(`menu-chapter-${last.current}`)?.focus({ preventScroll: true });
      last.current = null;
    }
  }, [sub]);

  const plan = { cta, pathname, onNavigate };

  return (
    <div
      ref={body}
      className="menu-body menu-drill"
      data-lenis-prevent
      data-still={animate ? undefined : ''}
    >
      <div className="menu-panes">
        <div
          className="menu-pane menu-level menu-scroller"
          data-lenis-prevent
          data-away={sub ? '' : undefined}
          inert={sub !== null}
          onKeyDown={(event) => {
            if (moveFocus(event.currentTarget, event.key)) event.preventDefault();
          }}
        >
          <div className="menu-chapters">
            {menuChapters.map((id, i) => (
              <button
                key={id}
                type="button"
                id={`menu-chapter-${id}`}
                className="menu-chapter"
                aria-expanded={sub === id}
                aria-controls={sub === id ? `menu-sub-${id}` : undefined}
                onClick={() => onSelect(id)}
                onKeyDown={(event) => {
                  if (event.key !== 'ArrowRight') return;
                  event.preventDefault();
                  onSelect(id);
                }}
              >
                <span className="menu-band">
                  <span className="menu-chapter-in menu-rise" style={at(180 + i * 50)}>
                    {here === id && <span className="status-mark menu-here" aria-hidden />}
                    <span className="menu-chapter-label">{menuNav.chapters[id].label}</span>
                    {here === id && <span className="sr-only"> (current section)</span>}
                  </span>
                </span>
                <span className="menu-fade" style={at(180 + i * 50)}>
                  <Chevron />
                </span>
              </button>
            ))}
          </div>

          <PagesList pathname={pathname} onNavigate={onNavigate} delay={340} />
          <ContactLines delay={400} />
        </div>

        <AnimatePresence initial={false}>
          {sub && (
            <SubPane key={sub} id={sub} animate={animate} reduced={reduced} onBack={onBack}>
              {/* For the keyboard and for screen readers; the thumb's way back is in the foot. */}
              <button type="button" className="menu-back-focus nav-label" onClick={onBack}>
                Back to menu
              </button>
              <ChapterContent
                id={sub}
                menu={menu}
                entry="sub"
                titleId={`menu-sub-${sub}-title`}
                pathname={pathname}
                onNavigate={onNavigate}
              />
            </SubPane>
          )}
        </AnimatePresence>
      </div>

      {/* Two states in one place, cross-faded: no width is animated. */}
      <div className="menu-foot">
        <div className="menu-foot-state" data-on={sub ? undefined : ''} inert={sub !== null}>
          <PlanButton {...plan} className="menu-in-near" style={at(380)} />
        </div>
        <div className="menu-foot-state" data-on={sub ? '' : undefined} inert={sub === null}>
          <button type="button" className="menu-back" aria-label="Back to menu" onClick={onBack}>
            <BackArrow />
            <span className="nav-label">Menu</span>
          </button>
          {/* Beside the way back the button is narrower: no arrow, so its
              label keeps to one line on the smallest phones. */}
          <PlanButton {...plan} arrow={false} />
        </div>
      </div>
    </div>
  );
}
