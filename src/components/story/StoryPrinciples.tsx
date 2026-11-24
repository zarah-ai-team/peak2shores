'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export type StoryPrinciple = {
  title: string;
  lead: string;
  body: string;
  img: string;
  alt: string;
  /** Where the frame crops the photograph (CSS object-position). */
  pos?: string;
};

/**
 * The four principles as a story told by scrolling (story.css): on a wide
 * screen a framed photograph stays in view on the left while the principles
 * pass on the right, and the photograph turns to the principle that holds
 * the middle of the screen, which alone is in full ink, its name in the
 * frame's caption. On a narrower screen nothing is pinned: each principle
 * carries its own photograph above it. Every word is always on the page.
 */
export function StoryPrinciples({ items }: { items: StoryPrinciple[] }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const i = refs.current.indexOf(entry.target as HTMLLIElement);
          if (i >= 0) setActive(i);
        }
      },
      // A principle is current while it crosses the middle band of the screen.
      { rootMargin: '-45% 0px -45% 0px' },
    );
    for (const el of refs.current) if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="st-pr">
      <div className="st-pr-frame" aria-hidden>
        <div className="st-pr-pics">
          {items.map((item, i) => (
            <Image
              key={item.img}
              src={item.img}
              alt=""
              fill
              sizes="40vw"
              className={`fill photo-grade ${i === active ? 'on' : ''}`}
              style={item.pos ? { objectPosition: item.pos } : undefined}
            />
          ))}
        </div>
        <span className="st-pr-cap">{items[active]?.title}</span>
      </div>

      <ol className="st-pr-list">
        {items.map((item, i) => (
          <li
            key={item.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={i === active ? 'on' : ''}
          >
            <figure className="st-pr-pic">
              <Image
                src={item.img}
                alt={item.alt}
                fill
                sizes="(min-width: 641px) 80vw, 100vw"
                className="fill photo-grade"
                style={item.pos ? { objectPosition: item.pos } : undefined}
              />
            </figure>
            <h3>{item.title}</h3>
            <p className="st-pr-lead">{item.lead}</p>
            <p className="st-pr-body">{item.body}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
