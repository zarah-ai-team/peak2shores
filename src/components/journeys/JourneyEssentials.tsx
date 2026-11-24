import { RateIcon, type RateIconName } from './RateIcon';
import './journey-editorial.css';
import './journey-rates.css';

/**
 * What the journey's guide covers: the topics of Ishika's notes of 9 November
 * 2026 (item 24b), each with its icon and a line on what it covers. The lines
 * say what the guide will address, not what it says, so they hold for every
 * journey.
 */
const topics: { t: string; d: string; icon: RateIconName }[] = [
  {
    t: 'Passports and visas',
    d: 'Passport validity and the entry requirements of each country you visit.',
    icon: 'passport',
  },
  {
    t: 'Health',
    d: 'Vaccinations, medication and the fitness the journey asks of you.',
    icon: 'health',
  },
  {
    t: 'Travel insurance',
    d: 'The cover we recommend arranging before you travel.',
    icon: 'shield',
  },
  {
    t: 'What to pack',
    d: 'Clothing and essentials for each stage of the journey.',
    icon: 'luggage',
  },
  {
    t: 'Hotels subject to change',
    d: 'How a hotel may be replaced by another of equal standard.',
    icon: 'hotel',
  },
  {
    t: 'Booking terms',
    d: 'Deposits, payments, changes and cancellation.',
    icon: 'card',
  },
];

/**
 * Essential information, after Dates and prices: the topics of the journey's
 * guide as a ruled grid, the house table's lines (an ink rule above and
 * below, hairlines between), and beneath it a band that says where the PDF
 * will be. Until Marc sends the wording and a PDF for each journey it offers
 * no download (the owner's decisions of 18 November 2026). Scoped to `.jy`;
 * the styles are journey-rates.css's.
 */
export function JyEssentials() {
  return (
    <section className="jy ess" id="essentials" aria-labelledby="jy-ess-h">
      <header className="dp-h">
        <div>
          <p className="lab">Before you travel</p>
          <h2 id="jy-ess-h">Essential information</h2>
        </div>
        <p className="dp-lede">
          Your journey guide sets out everything to arrange before you leave. It covers:
        </p>
      </header>

      <ul className="ess-g">
        {topics.map((x) => (
          <li key={x.t}>
            <span className="ess-i">
              <RateIcon name={x.icon} />
            </span>
            <h3>{x.t}</h3>
            <p>{x.d}</p>
          </li>
        ))}
      </ul>

      <div className="ess-pdf" aria-labelledby="jy-ess-pdf">
        <span className="ess-pdf-i">
          <RateIcon name="document" />
        </span>
        <div>
          <p className="lab" id="jy-ess-pdf">
            The PDF guide
          </p>
          <p className="t">The PDF for this journey will be available here soon.</p>
        </div>
        <span className="ess-soon">Coming soon</span>
      </div>
    </section>
  );
}
