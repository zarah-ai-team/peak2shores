import './journey-editorial.css';

/** What the journey's guide covers, in the words of Ishika's notes of 9 November 2026 (item 24b). */
const topics = [
  'Passports and visas',
  'Health',
  'Travel insurance',
  'What to pack',
  'Hotels subject to change',
  'Booking terms',
];

/**
 * Essential information, after Dates and rates: the topics of the journey's
 * guide, and where its PDF will be. Until Marc sends the wording and a PDF for
 * each journey, the section lists what the guide will cover and says the PDF
 * will be available here soon; it offers no download yet (the owner's
 * decisions of 18 November 2026). Scoped to `.jy`, like the page's other
 * sections.
 */
export function JyEssentials() {
  return (
    <section className="jy ess" id="essentials" aria-labelledby="jy-ess-h">
      <div className="ess-main">
        <p className="lab">Before you travel</p>
        <h2 id="jy-ess-h">Essential information</h2>
        <p className="say">The guide to this journey covers:</p>
        <ul className="topics">
          {topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
      <aside className="guide" aria-labelledby="jy-ess-pdf">
        <svg viewBox="0 0 24 24" aria-hidden>
          <path d="M6.5 2.75h7.25l4.75 4.75v13.75h-12z" />
          <path d="M13.5 2.75v5h5M9 12.5h6M9 15.5h6M9 18.5h3.5" />
        </svg>
        <p className="lab" id="jy-ess-pdf">
          The PDF guide
        </p>
        <p className="t">The PDF for this journey will be available here soon.</p>
      </aside>
    </section>
  );
}
