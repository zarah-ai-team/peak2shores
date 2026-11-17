'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { SiteMenu as SiteMenuData } from '@/lib/content/types';
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

type MenuTwoPaneProps = {
  menu: SiteMenuData;
  cta: NavItem;
  chapter: MenuChapterId;
  onSelect: (id: MenuChapterId) => void;
  /** False when the layout was swapped in by a resize: nothing replays. */
  animate: boolean;
  pathname: string;
  onNavigate: Navigate;
};

/**
 * The wide layout: a blue sidebar that holds the whole index (the three
 * sections, the other pages, the Plan button) and, beside it, a light panel
 * with the chosen section's rows. One panel is always showing.
 *
 * A section's name never leads nowhere. With a mouse, resting the pointer on
 * a name shows its rows, so the click that follows goes to the section's own
 * page; by touch or keyboard the first activation shows the rows and a second
 * one, on the name already showing, goes to the page. (Moving focus alone
 * changes nothing.) Every other entry in the sidebar is a plain link.
 */
export function MenuTwoPane({
  menu,
  cta,
  chapter,
  onSelect,
  animate,
  pathname,
  onNavigate,
}: MenuTwoPaneProps) {
  const tabs = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const here = sectionOf(pathname);

  // The panel changes in one step: the section that was showing is replaced at
  // once and the new one fades in under its own arrivals. Nothing waits on a
  // timer, so the panel can never be left showing a section other than the one
  // selected, and it is never out of the keyboard's reach while it changes.
  const [turns, setTurns] = useState(0);
  const show = (id: MenuChapterId) => {
    if (id !== chapter) setTurns((n) => n + 1);
    onSelect(id);
  };
  // Activating the name that is already showing follows the link at the head
  // of its panel ("All journeys"), through that link itself so the menu
  // closes and the page changes exactly as it does from there.
  const choose = (id: MenuChapterId) => {
    if (id === chapter) stage.current?.querySelector<HTMLAnchorElement>('.menu-headlink')?.click();
    else show(id);
  };
  // The pointer has to rest on a name for a moment before its rows show, so
  // crossing the list on the way to the panel does not flicker through it.
  const intent = useRef(0);
  const rest = (id: MenuChapterId) => {
    window.clearTimeout(intent.current);
    intent.current = window.setTimeout(() => show(id), 110);
  };
  const leave = () => window.clearTimeout(intent.current);
  useEffect(() => () => window.clearTimeout(intent.current), []);
  // A section starts at its top, wherever the one before it was left.
  useEffect(() => {
    stage.current?.scrollTo(0, 0);
  }, [chapter]);

  const onTabKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = [...(tabs.current?.querySelectorAll<HTMLElement>('[role="tab"]') ?? [])];
    const i = list.indexOf(document.activeElement as HTMLElement);
    if (i < 0) return;
    let next = i;
    if (event.key === 'ArrowDown') next = Math.min(list.length - 1, i + 1);
    else if (event.key === 'ArrowUp') next = Math.max(0, i - 1);
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = list.length - 1;
    else if (event.key === 'ArrowRight') {
      // Shows the section and steps into it.
      event.preventDefault();
      show(menuChapters[i]);
      stage.current?.focus();
      return;
    } else return;
    event.preventDefault();
    list[next]?.focus();
  };

  const onStageKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      tabs.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
    } else if (moveFocus(stage.current, event.key)) event.preventDefault();
  };

  return (
    <div className="menu-body menu-two" data-still={animate ? undefined : ''}>
      <div className="menu-side-top">
        <div
          ref={tabs}
          role="tablist"
          aria-orientation="vertical"
          aria-label="Menu sections"
          className="menu-tabs"
          onKeyDown={onTabKey}
        >
          {menuChapters.map((id, i) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`menu-tab-${id}`}
              aria-selected={chapter === id}
              aria-controls="menu-stage"
              tabIndex={chapter === id ? 0 : -1}
              className="menu-chapter"
              onClick={() => {
                leave();
                choose(id);
              }}
              onPointerEnter={(event) => {
                if (event.pointerType === 'mouse') rest(id);
              }}
              onPointerLeave={leave}
            >
              <span className="menu-band">
                <span className="menu-chapter-in menu-rise" style={at(180 + i * 50)}>
                  {here === id && <span className="status-mark menu-here" aria-hidden />}
                  <span className="menu-chapter-label">{menuNav.chapters[id].label}</span>
                  {here === id && <span className="sr-only"> (current section)</span>}
                </span>
              </span>
              {/* With its name, not ahead of it on an empty sheet. */}
              <span className="menu-fade" style={at(180 + i * 50)}>
                <Chevron />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* In the page before the rest of the sidebar, though it stands to the
          right of it: Tab goes from a section's name into its rows, and only
          then on to the other pages. A light island on the dark sheet. */}
      <div
        ref={stage}
        role="tabpanel"
        id="menu-stage"
        aria-labelledby={`menu-tab-${chapter}`}
        tabIndex={-1}
        className="menu-stage menu-scroller"
        data-tone="light"
        data-lenis-prevent
        onKeyDown={onStageKey}
      >
        <div key={chapter} className="menu-stage-in" data-replaced={turns > 0 ? '' : undefined}>
          <ChapterContent
            id={chapter}
            menu={menu}
            entry={turns > 0 ? 'switch' : 'open'}
            titleId={`menu-stage-title-${chapter}`}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        </div>
      </div>

      <div
        className="menu-side-bottom menu-scroller"
        data-lenis-prevent
        onKeyDown={(event) => {
          if (moveFocus(event.currentTarget, event.key)) event.preventDefault();
        }}
      >
        <PagesList pathname={pathname} onNavigate={onNavigate} delay={340} />
        <div className="menu-side-foot">
          <PlanButton
            cta={cta}
            pathname={pathname}
            onNavigate={onNavigate}
            className="menu-in-near"
            style={at(400)}
          />
          <ContactLines delay={440} />
        </div>
      </div>
    </div>
  );
}
