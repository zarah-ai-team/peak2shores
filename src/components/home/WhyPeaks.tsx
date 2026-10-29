import { included } from '@/lib/data/copy';
import { site } from '@/lib/site';
import './why-home.css';

/* Line icons, drawn on a 24px grid at a 1.4 stroke. */
const icons: Record<(typeof included)[number]['icon'], React.ReactNode> = {
  guests: null,
  car: (
    <>
      <path d="M4 16v-4l2-5h12l2 5v4" />
      <path d="M3 16h18v2H3z" />
      <circle cx="7.5" cy="16" r="1.6" />
      <circle cx="16.5" cy="16" r="1.6" />
      <path d="M6.5 12h11" />
    </>
  ),
  guide: (
    <>
      <circle cx="9" cy="6.5" r="2.5" />
      <path d="M4.5 20v-4.5c0-2.2 2-4 4.5-4s4.5 1.8 4.5 4V20" />
      <path d="M17 20V4" />
      <path d="M17 4.5h3.5l-1 2 1 2H17" />
    </>
  ),
  bed: (
    <>
      <path d="M3 18V7" />
      <path d="M3 13h18v5" />
      <path d="M21 13v-1.5a2.5 2.5 0 0 0-2.5-2.5H11v4" />
      <circle cx="7" cy="10.5" r="1.6" />
    </>
  ),
  glass: (
    <>
      <path d="M7.5 3h9l-.6 5.5A4 4 0 0 1 12 12a4 4 0 0 1-3.9-3.5z" />
      <path d="M12 12v8" />
      <path d="M8.5 20.5h7" />
      <path d="M8 7h8" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
};

/**
 * The Peaks2Shores Experience — the what: what is included on every journey,
 * answering "what's included?" after the beliefs above. The heading on the
 * left, six white boxes on the right; the first leads with the number that
 * defines the journeys (18 guests), the others with a blue line icon that
 * turns gold under the pointer. (The export keeps its old name, so the page
 * needs no change.)
 */
export function WhyPeaks() {
  return (
    <section className="hc-xpi" id="experience" aria-labelledby="experience-title">
      <div className="xpi-head">
        <p className="hw-lab lab">The what</p>
        <h2 id="experience-title">The Peaks2Shores Experience</h2>
        <p className="hw-sub">Included in every journey, so all you have to do is enjoy it.</p>
      </div>
      <ul className="xpi-grid">
        {included.map((b) => (
          <li key={b.title} className="box">
            {b.icon === 'guests' ? (
              <span className="big" aria-hidden>
                {site.maxGuests}
              </span>
            ) : (
              <svg
                className="ic"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                {icons[b.icon]}
              </svg>
            )}
            <h3>{b.title}</h3>
            <p>{b.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
