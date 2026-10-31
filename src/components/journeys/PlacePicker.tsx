'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { useSwipe } from '@/components/ui/useDrag';

export type PickerPlace = {
  name: string;
  nights?: number;
  part?: string;
  tagline: string;
  doing: string[];
  img?: string;
  alt: string;
};

/**
 * The places, one at a time: a row of tabs, the chosen place's photograph
 * blurred behind the whole section, and a deck of cards — the chosen one in
 * front, its neighbours fanned behind it. Each card has the photograph, the
 * place and its nights, Marc's line for it and what you will do there.
 * Arrows, the tabs, a click on a card behind, or a swipe move the deck.
 */
export function PlacePicker({ places, title }: { places: PickerPlace[]; title: string }) {
  const [i, setI] = useState(0);
  const deck = useRef<HTMLDivElement>(null);
  const n = places.length;
  const go = (k: number) => setI(((k % n) + n) % n);
  useSwipe(deck, (dir) => go(i + dir));

  return (
    <section className="jy pl" id="itinerary" aria-labelledby="jy-pl-h">
      {places.map((p, k) => (
        <div key={p.name} className={`plbg${k === i ? ' on' : ''}`} aria-hidden>
          {p.img && <Image className="fill" src={p.img} alt="" fill sizes="100vw" quality={85} />}
        </div>
      ))}
      <div className="plshade" aria-hidden />

      <div className="plhead">
        <p className="lab">
          The places · {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </p>
        <h2 id="jy-pl-h">{title}</h2>
      </div>

      <div className="tabs" role="tablist" aria-label="Choose a place">
        {places.map((p, k) => (
          <button
            key={p.name}
            type="button"
            role="tab"
            aria-selected={k === i}
            className={k === i ? 'on' : undefined}
            onClick={() => go(k)}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="deck" ref={deck}>
        {places.map((p, k) => {
          // Where this card sits relative to the chosen one: -2 … 2.
          let off = k - i;
          if (off > n / 2) off -= n;
          if (off < -n / 2) off += n;
          const near = Math.abs(off) <= 2;
          return (
            <article
              key={p.name}
              className={`pcard${off === 0 ? ' on' : ''}`}
              style={{
                ['--off' as string]: off,
                ['--abs' as string]: Math.abs(off),
                opacity: near ? 1 - Math.abs(off) * 0.28 : 0,
                zIndex: 10 - Math.abs(off),
                pointerEvents: near ? undefined : 'none',
              }}
              aria-hidden={off !== 0}
              onClick={off !== 0 ? () => go(k) : undefined}
            >
              <div className="pmedia">
                {p.img && (
                  <Image
                    className="fill"
                    src={p.img}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 900px) 34rem, 90vw"
                  />
                )}
                {p.nights ? (
                  <span className="pn">
                    {p.nights} {p.nights === 1 ? 'night' : 'nights'}
                  </span>
                ) : (
                  <span className="pn">Along the way</span>
                )}
              </div>
              <div className="pbody">
                {p.part && <p className="lab">{p.part}</p>}
                <h3>{p.name}</h3>
                <p className="tl">{p.tagline}</p>
                <ul>
                  {p.doing.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            </article>
          );
        })}
      </div>

      <div className="plctl">
        <button
          type="button"
          className="round"
          onClick={() => go(i - 1)}
          aria-label="Previous place"
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <span className="plbar" aria-hidden>
          <i style={{ width: `${((i + 1) / n) * 100}%` }} />
        </span>
        <button
          type="button"
          className="round fwd"
          onClick={() => go(i + 1)}
          aria-label="Next place"
        >
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  );
}
