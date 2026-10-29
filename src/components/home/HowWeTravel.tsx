import Image from 'next/image';
import { pillars, reasons } from '@/lib/data/copy';
import { getMedia } from '@/lib/media';
import { site } from '@/lib/site';

/**
 * How we travel — the four pillars as dark cards, the second and fourth set
 * lower, so the row reads as a sequence rather than a grid. Each card: its
 * number and name, the lead, the line, and its photograph.
 */
export function HowWeTravel() {
  return (
    <section className="hc-how" aria-labelledby="how-title">
      <div className="head">
        <div>
          <h2 id="how-title">How we travel</h2>
          <p className="sub-h">Four principles behind every journey.</p>
        </div>
        <p className="sub">
          Peaks2Shores isn’t a personal brand. It’s a promise — and these are the four parts of it.
        </p>
      </div>
      <ol className="cards">
        {pillars.map((p) => {
          const photo = getMedia(p.media);
          return (
            <li key={p.n} className="card">
              <div className="top">
                <span className="n">{p.n}</span>
                <span className="tag">{p.title} +</span>
              </div>
              <h3>{p.lead}</h3>
              <p>{p.body}</p>
              {photo.src && (
                <div className="ph">
                  <Image
                    src={photo.src}
                    alt={photo.alt ?? ''}
                    fill
                    sizes="(max-width: 900px) 90vw, 22vw"
                    className="fill"
                  />
                </div>
              )}
              <span className="cap">— {p.title}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

const icons: Record<string, React.ReactNode> = {
  'Personally curated': <path d="M4 20l4-1L19 8l-3-3L5 16l-1 4ZM14 7l3 3" />,
  'Local relationships': (
    <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a2.5 2.5 0 1 0 0-5M3 20c0-3.3 2.7-5 6-5s6 1.7 6 5m2-5c2.4.3 4 1.8 4 5" />
  ),
  'Time to enjoy': <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v4l3 2" />,
  'Exceptional stays': <path d="M3 19V6m0 7h18v6M3 10h7a3 3 0 0 1 3 3M21 13a3 3 0 0 0-3-3h-5" />,
  'Seamless by nature': (
    <path d="M5 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM19 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6.5 15.5l11-9" />
  ),
};

/**
 * Why travel with us — the headline on the left and the six reasons as a
 * three-by-two set of cards on the right. The first leads with the number
 * that defines the journeys (18 guests); the others carry a small line icon.
 * Every card is white; the one under the pointer turns night blue.
 */
export function WhyTravel() {
  return (
    <section className="hc-wtu" aria-labelledby="wtu-title">
      <div className="head">
        <h2 id="wtu-title">Why travel with us</h2>
        <p className="sub-h">
          Someone who really knows travel has already done the filtering for you.
        </p>
      </div>
      <ul className="grid">
        {reasons.map((r, i) => (
          <li key={r.n} className="tile">
            {i === 0 ? (
              <span className="big" aria-hidden>
                {site.maxGuests}
              </span>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="ic"
              >
                {icons[r.title]}
              </svg>
            )}
            <h3>{r.title}</h3>
            <p>{r.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
