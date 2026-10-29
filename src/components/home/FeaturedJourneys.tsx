import Link from 'next/link';
import { Arrow } from '@/components/ui/Button';
import { Frame } from '@/components/ui/Frame';
import { StatusTag } from '@/components/ui/StatusTag';
import { journeyTagStatus } from '@/components/pages/journeyStatus';
import type { JourneySummary } from '@/lib/content';
import type { MediaKey } from '@/lib/media';
import { site } from '@/lib/site';

/* One bright frame per journey of its own, so no photograph on the homepage
   is shown twice (the Journeys index and each journey's page open on others).
   A journey without one falls back to its list frame. */
const homeFrames: Record<string, MediaKey> = {
  'the-swiss-lakes': 'dep-swiss-lakes',
  'amalfi-slowly': 'dep-amalfi',
  'como-and-the-engadin': 'dep-como',
  'mallorca-beyond-the-coast': 'dep-mallorca',
  'the-cape-unhurried': 'dep-cape',
};

/** What sets a Peaks2Shores group apart, said once above the journeys. */
const promises = [
  { title: 'Never more than 18 guests', line: 'Small enough for every table, boat and doorway.' },
  {
    title: 'Personally curated',
    line: 'Places Marc knows well, and people he has known for years.',
  },
  { title: 'Thoughtfully paced', line: 'Fewer moves, longer stays, and free time on purpose.' },
];

/**
 * 03 — Small Luxury Group Journeys, set like a journal: the soonest departure
 * as the lead story (a wide photograph, the story beside it), the rest as a
 * row of entries under one rule. Each entry reads country and length, the
 * title, its one line, then dates, group and price on a single quiet line.
 * The title is the link; its hit area covers the whole entry. All the
 * journeys are a quiet link beneath the row.
 */
export function FeaturedJourneys({ journeys }: { journeys: JourneySummary[] }) {
  const upcoming = journeys
    .filter((j) => j.status !== 'past')
    .sort((a, b) => a.departureISO.localeCompare(b.departureISO));
  if (upcoming.length === 0) return null;
  const [lead, ...rest] = upcoming;

  return (
    <section className="hc-jr" id="journeys" aria-labelledby="journeys-title">
      <div className="head">
        <h2 id="journeys-title">Small Luxury Group Journeys</h2>
        <p className="sub-h">A few journeys a year. Each one we’d take ourselves.</p>
      </div>

      <ul className="promises">
        {promises.map((p) => (
          <li key={p.title}>
            <h3>{p.title}</h3>
            <p>{p.line}</p>
          </li>
        ))}
      </ul>

      <JournalEntry journey={lead} lead />

      {rest.length > 0 && (
        <ul className="entries">
          {rest.map((journey) => (
            <li key={journey.slug}>
              <JournalEntry journey={journey} />
            </li>
          ))}
        </ul>
      )}

      {/* The way on, once every departure has been seen. */}
      <div className="all">
        <Link className="tlink" href="/journeys">
          View all journeys <Arrow />
        </Link>
      </div>
    </section>
  );
}

function JournalEntry({ journey, lead = false }: { journey: JourneySummary; lead?: boolean }) {
  const titleId = `home-${journey.slug}-title`;
  const tag = journeyTagStatus(journey);
  const hosted = journey.tags.includes('Hosted by Marc');

  return (
    <article aria-labelledby={titleId} className={`entry group ${lead ? 'first' : ''}`}>
      <div className="ph">
        <Frame
          ratio={lead ? '16/10' : '6/7'}
          media={homeFrames[journey.slug] ?? journey.listMedia}
          hover
          sizes={lead ? '(min-width: 1024px) 60vw, 100vw' : '(min-width: 1024px) 25vw, 50vw'}
        />
      </div>
      <div className="txt">
        <p className="kick">
          <span>{journey.country}</span>
          <span aria-hidden>·</span>
          <span>{journey.days} days</span>
          {hosted && (
            <>
              <span aria-hidden>·</span>
              <span>Hosted by {site.founder.name.split(' ')[0]}</span>
            </>
          )}
        </p>
        <h3 id={titleId}>
          <Link href={`/journeys/${journey.slug}`}>{journey.title}</Link>
        </h3>
        <p className="line">{journey.lead}</p>
        <p className="facts">
          <span>{journey.departureWindow}</span>
          <span>Max. {journey.groupMax} guests</span>
          <span>
            From <b>{journey.priceFrom}</b>
          </span>
        </p>
        <p className="foot">
          {tag !== 'open' && <StatusTag status={tag} />}
          <span className="more" aria-hidden>
            Read the journey <Arrow />
          </span>
        </p>
      </div>
    </article>
  );
}
