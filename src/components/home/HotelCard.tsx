'use client';

import { useState } from 'react';
import { Frame } from '@/components/ui/Frame';
import type { HomeContent } from '@/lib/content';
import type { MediaKey } from '@/lib/media';

type Hotel = HomeContent['signatureHotels'][number];

/**
 * One hotel, large: the photograph with the place and name over its foot.
 * The reverse — why it earned its place, the signature detail, what is nearby
 * — rises over the photograph on hover or focus, or when the card is tapped
 * (the button carries the state, so a touch reader can turn it back). The
 * reverse is always in the document; only its visibility changes.
 */
export function HotelCard({ hotel, index }: { hotel: Hotel; index: number }) {
  const [turned, setTurned] = useState(false);
  const panelId = `hotel-${index + 1}-detail`;

  return (
    <article
      className="group relative isolate aspect-[4/5] overflow-hidden bg-forest-deep text-on-dark lg:aspect-[3/4]"
      aria-labelledby={`hotel-${index + 1}-name`}
    >
      <div className="absolute inset-0 -z-10">
        <Frame
          media={`home-hotel-${index + 1}` as MediaKey}
          hover
          decorative
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          overlay="caption"
          className="h-full"
        />
      </div>

      <div className="flex h-full flex-col justify-end p-6 lg:p-8">
        <div className="kicker-sm mb-3 text-on-dark/85">{hotel.place}</div>
        <h3 id={`hotel-${index + 1}-name`} className="h4 m-0 max-w-[18ch]">
          <button
            type="button"
            onClick={() => setTurned((t) => !t)}
            aria-expanded={turned}
            aria-controls={panelId}
            className="text-left after:absolute after:inset-0 after:content-['']"
          >
            {hotel.name}
          </button>
        </h3>
      </div>

      <div
        id={panelId}
        className={`pointer-events-none absolute inset-0 flex flex-col justify-end bg-forest-deep/92 p-6 transition-[opacity,transform] duration-700 ease-[var(--ease-editorial)] lg:p-8 ${
          turned
            ? 'translate-y-0 opacity-100'
            : 'translate-y-4 opacity-0 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100'
        }`}
      >
        <div className="kicker-sm mb-3 text-on-dark-muted">{hotel.place}</div>
        <p className="h5 mb-4 text-on-dark">{hotel.name}</p>
        <p className="prose-body-sm mb-6 text-on-dark-body">{hotel.why}</p>
        <dl className="m-0 grid gap-4 border-t border-line-dark pt-5">
          <div>
            <dt className="kicker-sm mb-1 text-gorse">Signature detail</dt>
            <dd className="meta m-0 text-on-dark">{hotel.detail}</dd>
          </div>
          <div>
            <dt className="kicker-sm mb-1 text-gorse">Nearby</dt>
            <dd className="meta m-0 text-on-dark">{hotel.nearby}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
