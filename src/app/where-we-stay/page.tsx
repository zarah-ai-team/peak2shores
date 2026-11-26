import Image from 'next/image';
import Link from 'next/link';
import { Arrow } from '@/components/ui/Button';
import { PageTitle } from '@/components/ui/Editorial';
import { Reveal } from '@/components/motion/Reveal';
import { stayHotels, staysNote } from '@/lib/data/homeHotels';
import { PRIVATE_TRAVEL_HREF } from '@/lib/links';
import { pageMetadata } from '@/lib/seo';
import './where-we-stay.css';

export const metadata = pageMetadata({
  title: 'Where we stay',
  description:
    'The hotels, lodges and hideaways Peaks2Shores travelers return to, from Lake Lucerne, Zermatt and Lake Maggiore to the Zambezi, the Adriatic and the Kenyan coast.',
  path: '/where-we-stay',
});

/**
 * The second photograph overlaps a lower corner of the first. A hotel that
 * stands on the right of its own photograph (the horizontal part of its `pos`
 * is past the middle) would be hidden behind it, so that pair is mirrored.
 */
const standsRight = (pos?: string) => parseFloat(pos ?? '') > 50;

/**
 * Where we stay (2 Nov notes), reached from the site menu. Each place in a
 * few words, with both of its photographs: the hotel itself, and beside it
 * the place around it (the lake boat at Lucerne's quay, Zermatt at night,
 * Isola Bella, Victoria Falls, Rovinj's Old Town, Cardamom House from the
 * air). Brought up to date for Marc's review of 23 Nov 2026 (Ishika's note
 * on this page): the Swiss Elegance hotels as they now are, Marc's note that
 * the final hotels may vary by departure, and the Private Travel form in
 * place of "Request details". The list is src/lib/data/homeHotels.ts, which
 * the homepage's cards share. The hotels' own photographs are credited on
 * /credits; what is known of Marc's is recorded in
 * reports/image-asset-plan.md, and one gets a row on /credits once its
 * author and licence are confirmed.
 */
export default function WhereWeStayPage() {
  return (
    <>
      <PageTitle kicker="Where we stay" title="Hotels & Lodges">
        Exceptional Places to Stay. Extraordinary Experiences to Remember.
        <span className="wws-note">{staysNote}</span>
      </PageTitle>

      <ol className="wws container-site" aria-label="Hotels and lodges">
        {stayHotels.map((h, i) => (
          <Reveal as="li" key={h.name} className="wws-item">
            <div className={standsRight(h.pos) ? 'wws-photos mirrored' : 'wws-photos'}>
              {/* The main frame is 4:3 and crops where the homepage card
                  does (`pos`), so a hotel at one side of a wide photograph
                  stays in view. The first is in the first screen, and the
                  largest thing in it: it loads first. */}
              <div className="wws-main">
                <Image
                  src={h.img}
                  alt={h.alt}
                  fill
                  sizes="(max-width: 559px) 100vw, 40vw"
                  priority={i === 0}
                  style={h.pos ? { objectPosition: h.pos } : undefined}
                />
              </div>
              {/* The second view is a landscape photograph in an upright frame:
                  it is drawn about twice as wide as the frame, which is the
                  width `sizes` states, and `backPos` says which part of it
                  shows. */}
              {h.back && (
                <div className="wws-second">
                  <Image
                    src={h.back}
                    alt={h.backAlt ?? h.alt}
                    fill
                    sizes="(max-width: 559px) 72vw, 36vw"
                    style={h.backPos ? { objectPosition: h.backPos } : undefined}
                  />
                </div>
              )}
            </div>
            <div className="wws-text">
              <p className="wws-num" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </p>
              <p className="wws-place">{h.place}</p>
              <h2>{h.name}</h2>
              <p className="wws-sig">{h.signature}</p>
              <div className="wws-near">
                <p className="wws-lab">Nearby</p>
                <p>{h.nearby}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </ol>

      <section className="container-site wws-end">
        <p>Each of these places can be part of a private journey shaped around you.</p>
        <Link className="btn btn-ink" href={PRIVATE_TRAVEL_HREF}>
          Start a private journey <Arrow />
        </Link>
      </section>
    </>
  );
}
