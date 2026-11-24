'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useAdvance } from './useAdvance';

export type ExperiencePanel = {
  slug: string;
  title: string;
  body: string;
  img?: string;
  alt: string;
  /** The photograph's own tone, shown before it arrives. */
  tone?: string;
  /** Where the tall panel crops the photograph (CSS object-position). */
  pos?: string;
  /** The page that tells more. */
  href?: string;
};

/**
 * The ways to travel as one row of tall photographs. One stands open at a
 * time and the row moves through them on its own while it is on screen;
 * pointing at one (or focusing or tapping its name) opens it and holds it.
 * Every name and line is always shown — the open panel only gives its
 * photograph more room. A press anywhere on a panel opens its way's page. Each panel is its own section with its own anchor.
 * Below 1100px the row becomes a set of cards and nothing moves.
 */
export function ExperiencePanels({ items }: { items: ExperiencePanel[] }) {
  const { ref, current, running, select, next, hold, release } = useAdvance<HTMLDivElement>(
    items.length,
    items.map((x) => x.slug),
  );

  return (
    <div ref={ref} className={`xp-panels ${running ? 'run' : ''}`} onMouseLeave={release}>
      {items.map((x, i) => {
        const on = i === current;
        const titleId = `${x.slug}-title`;
        return (
          <section
            key={x.slug}
            id={x.slug}
            aria-labelledby={titleId}
            className={`xp-panel ${on ? 'on' : ''}`}
            onMouseEnter={() => {
              select(i);
              hold();
            }}
          >
            {/* The whole panel opens the way's page: an invisible link over
                it, for the pointer only. The keyboard and a screen reader
                keep the one "Discover" link below, so the page is not
                announced twice. */}
            {x.href && (
              <Link className="hit" href={x.href} tabIndex={-1} aria-hidden>
                <span className="sr-only">{x.title}</span>
              </Link>
            )}
            <div className="pic" style={{ backgroundColor: x.tone }}>
              {x.img && (
                // From 641 to 1099px the cards are 4:5, two to a row (the
                // last one across both): a landscape photograph covering one
                // is drawn by its height, about 1.9 times the card's width.
                <Image
                  src={x.img}
                  alt={x.alt}
                  fill
                  sizes="(min-width: 1100px) 40vw, (min-width: 641px) 90vw, 100vw"
                  className="fill photo-grade"
                  style={x.pos ? { objectPosition: x.pos } : undefined}
                />
              )}
            </div>
            <div className="txt">
              <h3 id={titleId}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => select(i)}
                  onFocus={() => {
                    select(i);
                    hold();
                  }}
                  onBlur={release}
                >
                  {x.title}
                </button>
              </h3>
              <p>{x.body}</p>
              {x.href && (
                <Link className="more" href={x.href} aria-label={`Discover ${x.title}`}>
                  Discover <span aria-hidden>→</span>
                </Link>
              )}
              <span className="bar" aria-hidden>
                <i onAnimationEnd={next} />
              </span>
            </div>
          </section>
        );
      })}
    </div>
  );
}
