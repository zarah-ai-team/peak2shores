'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';
import type {
  MenuJourney,
  MenuPhoto as Photo,
  SiteMenu as SiteMenuData,
} from '@/lib/content/types';
import { menuNav, site, type MenuChapterId, type NavItem } from '@/lib/site';
import { Arrow, ButtonLink } from '@/components/ui/Button';

/**
 * Called by every link to a page of the site, so the menu closes as the page
 * changes. (The phone and the email leave the site; they do not call it, and
 * the menu stays as it is behind them.)
 */
export type Navigate = (href: string, event: MouseEvent<HTMLAnchorElement>) => void;

/**
 * When a block of a section arrives, in milliseconds after its container: the
 * delays the stylesheet reads as `--d`. `open` is the panel as the sheet
 * opens, `switch` the same panel after a change of section, and `sub` a
 * section opened on a phone. Rows follow one another by `step`. (The section
 * names and the rest of the sidebar carry their delays where they are
 * rendered, in MenuTwoPane and MenuDrill.)
 */
export const ENTRY = {
  open: { head: 220, row: 260, step: 50 },
  switch: { head: 0, row: 30, step: 30 },
  sub: { head: 80, row: 110, step: 30 },
} as const;
export type Entry = keyof typeof ENTRY;

/**
 * What a photograph is asked for at each width. The frames are small (120px
 * beside a journey or a country, 64px beside a way to travel), so the files
 * are too.
 */
export const FEATURE_SIZES = '(min-width: 1024px) 120px, 96px';
export const LIST_SIZES = '64px';

/** A block's delay, as the custom property the stylesheet reads. */
export const at = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties;

/** A long list must not trickle in: rows past the cap arrive with the last staggered one. */
const capped = (i: number, cap: number) => Math.min(i, cap);

/**
 * A photograph in its frame. The frame holds a quiet tint until the file has
 * loaded, then a cover in that tint draws down off it (it is held at its
 * bottom edge, as the covers of the site's frames are, so the picture shows
 * from the top). The picture itself never moves or scales. Decorative: every
 * photograph here sits inside the link that names it. A file that never loads
 * leaves its frame the plain tint it started as.
 */
export function MenuPhoto({
  photo,
  sizes,
  delay = 0,
}: {
  photo: Photo | null;
  sizes: string;
  delay?: number;
}) {
  const [loaded, setLoaded] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  // A photograph already in the cache has loaded before React can listen for it.
  useEffect(() => {
    if (img.current?.complete && img.current.naturalWidth > 0) setLoaded(true);
  }, []);

  return (
    <span className="menu-photo" data-loaded={loaded ? '' : undefined} style={at(delay)}>
      {photo && (
        <>
          <Image
            ref={img}
            src={photo.src}
            alt=""
            fill
            sizes={sizes}
            quality={85}
            className="photo-grade"
            style={photo.pos ? { objectPosition: photo.pos } : undefined}
            onLoad={() => setLoaded(true)}
          />
          <span className="menu-photo-cover" data-nav-cover aria-hidden />
        </>
      )}
    </span>
  );
}

/**
 * Fetches the journeys' photographs ahead of the menu, the first time the
 * button is pointed at, focused or touched, so the frames are not empty when
 * the sheet arrives. The same source, sizes and quality as the rows, so the
 * browser asks for the same files; a 1px clipped holder rather than
 * `display: none`, which would not load them.
 */
export function MenuWarm({ journeys }: { journeys: MenuJourney[] }) {
  return (
    <span className="menu-warm" aria-hidden>
      {journeys.map(
        (journey) =>
          journey.photo && (
            <Image
              key={journey.slug}
              src={journey.photo.src}
              alt=""
              fill
              sizes={FEATURE_SIZES}
              quality={85}
              loading="eager"
              fetchPriority="low"
            />
          ),
      )}
    </span>
  );
}

export function Chevron() {
  return (
    <svg
      aria-hidden
      focusable="false"
      className="menu-chevron"
      width="7"
      height="12"
      viewBox="0 0 7 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
    >
      <path d="M1 1l5 5-5 5" />
    </svg>
  );
}

/** Which section the page being read belongs to, if any. */
export function sectionOf(pathname: string): MenuChapterId | null {
  if (pathname.startsWith('/journeys')) return 'journeys';
  if (pathname.startsWith('/destinations')) return 'destinations';
  return null;
}

/** The current page is marked only on a link to the page itself, never on one to a part of it. */
const isCurrent = (href: string, pathname: string) => !href.includes('#') && href === pathname;

/**
 * One row of a section: a small photograph, a title, and at most one quiet
 * line above and one below it. The whole row is the link, photograph and
 * arrow included, so there is one large target and nothing dead inside it.
 * `feature` rows (a journey, a country) carry the larger photograph; `list`
 * rows (a way to travel) are a title beside a thumbnail.
 */
function Row({
  href,
  size,
  kicker,
  tag,
  title,
  line,
  photo,
  i,
  entry,
  pathname,
  onNavigate,
}: {
  href: string;
  size: 'feature' | 'list';
  kicker?: string;
  /** 'New', 'Waitlist' or 'Sold out', after the kicker. */
  tag?: string | null;
  title: string;
  line?: ReactNode;
  photo: Photo | null;
  i: number;
  entry: Entry;
  pathname: string;
  onNavigate: Navigate;
}) {
  const t = ENTRY[entry];
  const delay = t.row + capped(i, 4) * t.step;
  return (
    <li className="menu-row-item">
      <Link
        href={href}
        className={`menu-row menu-row--${size} group menu-in`}
        style={at(delay)}
        aria-current={isCurrent(href, pathname) ? 'page' : undefined}
        onClick={(event) => onNavigate(href, event)}
      >
        <MenuPhoto
          photo={photo}
          sizes={size === 'feature' ? FEATURE_SIZES : LIST_SIZES}
          delay={delay + 40}
        />
        <span className="menu-row-text">
          {(kicker || tag) && (
            <span className="menu-row-kicker">
              {kicker && <span>{kicker}</span>}
              {tag && <span className="menu-status">{tag}</span>}
            </span>
          )}
          <span className="menu-row-title">{title}</span>
          {line && <span className="menu-row-line">{line}</span>}
        </span>
        <span className="menu-row-arrow" aria-hidden>
          <Arrow />
        </span>
      </Link>
    </li>
  );
}

/**
 * The content of one section, used by both layouts: the panel beside the
 * sidebar and the pane a section opens on a phone. On the panel the heading
 * is a quiet caps line; on a phone, where it also says where the reader now
 * is, it is the section's name set large.
 */
export function ChapterContent({
  id,
  menu,
  entry,
  titleId,
  pathname,
  onNavigate,
}: {
  id: MenuChapterId;
  menu: SiteMenuData;
  entry: Entry;
  titleId: string;
  pathname: string;
  onNavigate: Navigate;
}) {
  const chapter = menuNav.chapters[id];
  const t = ENTRY[entry];
  const common = { entry, pathname, onNavigate };

  const head = (
    <div className="menu-head menu-in" style={at(t.head)}>
      <h2 id={titleId} className="menu-head-title">
        {entry === 'sub' ? chapter.label : chapter.heading}
      </h2>
      <Link
        href={chapter.all.href}
        className="link-rule menu-headlink"
        aria-current={isCurrent(chapter.all.href, pathname) ? 'page' : undefined}
        onClick={(event) => onNavigate(chapter.all.href, event)}
      >
        {chapter.all.label}
        <Arrow />
      </Link>
    </div>
  );

  if (id === 'journeys') {
    const shared = menu.datesNote !== null;
    return (
      <>
        {head}
        <ul className="menu-rows" aria-labelledby={titleId}>
          {menu.journeys.map((journey, i) => (
            <Row
              key={journey.slug}
              href={journey.href}
              size="feature"
              kicker={journey.country}
              tag={journey.label}
              title={journey.name}
              line={`${journey.days} days · ${journey.route}${shared ? '' : ` · ${journey.departure}`}`}
              photo={journey.photo}
              i={i}
              {...common}
            />
          ))}
        </ul>
        {menu.datesNote && (
          <p
            className="menu-note menu-fade"
            style={at(t.row + capped(menu.journeys.length, 4) * t.step)}
          >
            {menu.datesNote}
          </p>
        )}
      </>
    );
  }

  if (id === 'destinations')
    return (
      <>
        {head}
        <ul className="menu-rows" aria-labelledby={titleId}>
          {menu.destinations.map((place, i) => {
            const count = place.journeys.length;
            return (
              <Row
                key={place.slug}
                href={place.href}
                size="feature"
                kicker={count > 0 ? `${count} ${count === 1 ? 'journey' : 'journeys'}` : undefined}
                title={place.country}
                // Each journey's name stays whole: the line breaks between
                // names, never inside one.
                line={
                  count > 0
                    ? place.journeys.map((name, n) => (
                        <Fragment key={name}>
                          {n > 0 && ' · '}
                          <span className="menu-nowrap">{name}</span>
                        </Fragment>
                      ))
                    : undefined
                }
                photo={place.photo}
                i={i}
                {...common}
              />
            );
          })}
        </ul>
      </>
    );

  // The ways with a page of their own stand first; those that share one
  // address (the private ways) are listed together under its name.
  const own = menu.ways.filter((way) => !way.shared);
  const shared = menu.ways.filter((way) => way.shared);
  const groupId = `${titleId}-private`;
  return (
    <>
      {head}
      {own.length > 0 && (
        <ul className="menu-rows" aria-labelledby={titleId}>
          {own.map((way, i) => (
            <Row
              key={way.title}
              href={way.href}
              size="list"
              title={way.title}
              photo={way.photo}
              i={i}
              {...common}
            />
          ))}
        </ul>
      )}
      {shared.length > 0 && (
        <>
          <p
            id={groupId}
            className="menu-group menu-in"
            style={at(t.row + capped(own.length, 4) * t.step)}
          >
            {menuNav.chapters.ways.privateGroup}
          </p>
          <ul className="menu-rows" aria-labelledby={groupId}>
            {shared.map((way, i) => (
              <Row
                key={way.title}
                href={way.href}
                size="list"
                title={way.title}
                photo={way.photo}
                i={own.length + i}
                {...common}
              />
            ))}
          </ul>
        </>
      )}
    </>
  );
}

/** The pages that are not a section: each link goes straight to its page. */
export function PagesList({
  pathname,
  onNavigate,
  delay,
}: {
  pathname: string;
  onNavigate: Navigate;
  delay: number;
}) {
  return (
    <nav aria-label="More pages" className="menu-pages menu-in-near" style={at(delay)}>
      <ul>
        {menuNav.pages.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="menu-page"
              aria-current={isCurrent(item.href, pathname) ? 'page' : undefined}
              onClick={(event) => onNavigate(item.href, event)}
            >
              <span className="nav-link nav-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function PlanButton({
  cta,
  pathname,
  onNavigate,
  arrow = true,
  className = '',
  style,
}: {
  cta: NavItem;
  pathname: string;
  onNavigate: Navigate;
  arrow?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <ButtonLink
      href={cta.href}
      variant="light"
      arrow={arrow}
      className={`menu-plan ${className}`.trim()}
      style={style}
      aria-current={isCurrent(cta.href, pathname) ? 'page' : undefined}
      onClick={(event) => onNavigate(cta.href, event)}
    >
      {cta.label}
    </ButtonLink>
  );
}

/** The two quickest ways to reach the team; the rest is on the Plan page and in the footer. */
export function ContactLines({ delay }: { delay: number }) {
  return (
    <address className="menu-contact menu-in-near" style={at(delay)}>
      {site.phone && site.phoneHref && (
        <a href={`tel:${site.phoneHref}`} className="menu-contact-line">
          {site.phone}
        </a>
      )}
      <a href={`mailto:${site.email}`} className="menu-contact-line">
        {site.email}
      </a>
    </address>
  );
}

/**
 * Arrow keys through the links and buttons of one block, as an addition to
 * Tab: down and up move one control, Home and End jump to the ends.
 * Returns true when it has handled the key.
 */
export function moveFocus(container: HTMLElement | null, key: string) {
  if (!container || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) return false;
  const controls = [...container.querySelectorAll<HTMLElement>('a[href], button')].filter(
    (el) => el.getClientRects().length > 0 && !el.closest('[inert]'),
  );
  if (controls.length === 0) return false;
  const i = controls.indexOf(document.activeElement as HTMLElement);
  let next = i;
  if (key === 'Home') next = 0;
  else if (key === 'End') next = controls.length - 1;
  else if (key === 'ArrowDown') next = Math.min(controls.length - 1, i + 1);
  else next = i < 0 ? 0 : Math.max(0, i - 1);
  controls[next]?.focus();
  return true;
}
