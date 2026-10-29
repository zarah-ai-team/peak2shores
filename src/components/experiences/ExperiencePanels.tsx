'use client';

import Image from 'next/image';
import { useAdvance } from './useAdvance';

export type ExperiencePanel = {
  slug: string;
  title: string;
  body: string;
  img?: string;
  alt: string;
  /** The photograph's own tone, shown before it arrives. */
  tone: string;
};

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The five experiences as one row of tall photographs. One stands open at a
 * time and the row moves through them on its own while it is on screen;
 * pointing at one (or focusing or tapping its name) opens it and holds it.
 * Every name and line is always shown — the open panel only gives its
 * photograph more room. Each panel is its own section, so the anchors the
 * homepage links to (#taste, #meet…) still land. Below 1100px the row
 * becomes a set of cards and nothing moves.
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
            <div className="pic" style={{ backgroundColor: x.tone }}>
              {x.img && (
                <Image
                  src={x.img}
                  alt={x.alt}
                  fill
                  sizes="(min-width: 1100px) 40vw, (min-width: 640px) 50vw, 100vw"
                  className="fill photo-grade"
                />
              )}
            </div>
            <div className="txt">
              <span className="lab num">{pad(i + 1)}</span>
              <h2 id={titleId}>
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
              </h2>
              <p>{x.body}</p>
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
