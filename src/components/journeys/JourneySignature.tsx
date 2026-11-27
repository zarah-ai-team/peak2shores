import Image from 'next/image';
import type { JourneyFlyer } from '@/lib/journeys';
import { getMedia } from '@/lib/media';
import './signature.css';

/**
 * A journey's signature experiences, each with its photograph: what sets it
 * apart from a conventional tour (Marc's brief for The Soul of Sicily, 27
 * November 2026, chosen by the owner the same day). After the overview, three
 * across on a laptop, two on a tablet, and on a phone a row swiped sideways.
 */
export function JySignature({ signature }: { signature: NonNullable<JourneyFlyer['signature']> }) {
  const items = signature.items.map((x) => ({ ...x, m: getMedia(x.media) })).filter((x) => x.m.src);
  if (items.length === 0) return null;

  return (
    <section className="jy sig" id="signature" aria-labelledby="sig-h">
      <div className="sig-head">
        <p className="lab">Peaks2Shores signature</p>
        <h2 id="sig-h">Signature experiences</h2>
        {signature.intro && <p className="sig-intro">{signature.intro}</p>}
      </div>
      {/* On a phone the row scrolls sideways: a named region that takes focus,
          so the keyboard can move it in every browser (as ui/Rail). */}
      <div className="sig-rail" role="region" aria-label="Signature experiences" tabIndex={0}>
        <ol className="sig-row">
          {items.map((x, i) => (
            <li key={x.title} className="sig-card">
              <span className="ph" style={{ background: x.m.tone }}>
                <Image
                  src={x.m.src!}
                  alt={x.m.alt ?? ''}
                  fill
                  sizes="(max-width: 760px) 82vw, (max-width: 1100px) 46vw, 30vw"
                />
              </span>
              <span className="n" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3>{x.title}</h3>
              <p>{x.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
