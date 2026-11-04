import { included } from '@/lib/data/copy';
import './journeys-index.css';

/* Line icons, drawn on a 24px grid at a 1.5 stroke. */
const icons: Record<(typeof included)[number]['icon'], React.ReactNode> = {
  bell: (
    <>
      <path d="M4.5 17a7.5 7.5 0 0 1 15 0" />
      <path d="M3 17h18v1.5H3z" />
      <path d="M12 9.5V7.5" />
      <path d="M10.5 7.5h3" />
      <path d="M8 13.5a4.5 4.5 0 0 1 2.5-2.4" />
    </>
  ),
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
 * The Peaks2Shores Experience: the details that make the difference. Moved
 * from the homepage to the Journeys page (Ishika, 3 November 2026), Marc's
 * copy unchanged: the label, heading and line on the left, the six signature
 * touches in a 3 × 2 grid on the right. No photograph, no link onward.
 */
export function DetailsDifference() {
  return (
    <section className="xpd" id="experience" aria-labelledby="experience-title">
      <div className="xpd-head">
        <p className="xpd-lab">The Peaks2Shores Experience</p>
        <h2 id="experience-title">The details that make the difference.</h2>
        <p>Each journey’s page sets out exactly what it includes.</p>
      </div>
      <ul className="xpd-grid">
        {included.map((b) => (
          <li key={b.title}>
            <span className="ico" aria-hidden>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                focusable="false"
              >
                {icons[b.icon]}
              </svg>
            </span>
            <h3>{b.title}</h3>
            <p>{b.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
