'use client';

import Image from 'next/image';
import { Film, type FilmVisual } from './Film';
import { useAdvance } from './useAdvance';

export type Way = FilmVisual & { title: string; line: string };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * The ways to travel as a list beside a framed screen. The screen shows the
 * current way's film (or its still), and the list moves on by itself while
 * it is on screen, a fine line under the current way marking the time.
 * Pointing at, focusing or tapping a way brings it to the screen and holds
 * it there. Every title and line is always on the page; only the screen
 * changes. On a phone the screen would sit a long way from the list, so
 * each way carries its own still instead and nothing moves.
 */
export function WaysStage({ ways }: { ways: Way[] }) {
  const { ref, current, running, select, next, hold, release } = useAdvance<HTMLDivElement>(
    ways.length,
  );

  return (
    <div ref={ref} className={`xp-wg ${running ? 'run' : ''}`}>
      <div className="xp-stage">
        <span className="fr" aria-hidden />
        <div className="scr">
          {ways.map((way, i) => (
            <div key={way.title} className={`shot ${i === current ? 'on' : ''}`}>
              <Film visual={way} active={i === current} sizes="(min-width: 1100px) 46vw, 100vw" />
            </div>
          ))}
          <div className="cap" aria-hidden>
            <span>{ways[current].title}</span>
            <b>
              {pad(current + 1)}
              <small> / {pad(ways.length)}</small>
            </b>
          </div>
        </div>
      </div>

      <ul className="xp-wl" onMouseLeave={release}>
        {ways.map((way, i) => {
          const on = i === current;
          return (
            <li
              key={way.title}
              className={on ? 'on' : ''}
              onMouseEnter={() => {
                select(i);
                hold();
              }}
            >
              <div className="thumb">
                <Image
                  src={way.img}
                  alt={way.alt}
                  fill
                  sizes="100vw"
                  className="fill photo-grade"
                />
              </div>
              <span className="n">{pad(i + 1)}</span>
              <div>
                <h3>
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
                    {way.title}
                  </button>
                </h3>
                <p>{way.line}</p>
              </div>
              <span className="bar" aria-hidden>
                <i onAnimationEnd={next} />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
