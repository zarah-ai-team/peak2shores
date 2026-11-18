import Image from 'next/image';
import Link from 'next/link';
import { Arrow } from '@/components/ui/Button';
import { PageTitle } from '@/components/ui/Editorial';
import { Reveal } from '@/components/motion/Reveal';
import { hotels } from '@/lib/data/home';
import { pageMetadata } from '@/lib/seo';
import './where-we-stay.css';

export const metadata = pageMetadata({
  title: 'Where we stay',
  description:
    'The hotels, lodges and hideaways Peaks2Shores travelers return to, from Lake Lucerne and Lake Maggiore to the Zambezi, the Adriatic and the Kenyan coast.',
  path: '/where-we-stay',
});

/**
 * The second photograph overlaps a lower corner of the first. A hotel that
 * stands on the right of its own photograph (the horizontal part of its `pos`
 * is past the middle) would be hidden behind it, so that pair is mirrored.
 */
const standsRight = (pos?: string) => parseFloat(pos ?? '') > 50;

/**
 * Where we stay (2 Nov notes), reached from the site menu. Each place Marc
 * names, in his words, with both of its photographs
 * (his selection of 9 Nov): the hotel itself, and beside it the place around
 * it (the lake boat at Lucerne's quay, Isola Bella, Victoria Falls, Rovinj's
 * Old Town, Cardamom House from the air). What is known of each picture's
 * origin is recorded in reports/image-asset-plan.md; a picture gets an entry
 * in public/images/credits.json, and a row on /credits, once its author and
 * licence are confirmed.
 */
export default function WhereWeStayPage() {
  return (
    <>
      <PageTitle kicker="Where we stay" title="Hotels & Lodges">
        Exceptional Places to Stay. Extraordinary Experiences to Remember.
      </PageTitle>

      <ol className="wws container-site" aria-label="Hotels and lodges">
        {hotels.map((h, i) => (
          <Reveal as="li" key={h.name} className="wws-item">
            <div className={standsRight(h.pos) ? 'wws-photos mirrored' : 'wws-photos'}>
              <div className="wws-main">
                <Image src={h.img} alt={h.alt} fill sizes="(max-width: 900px) 100vw, 40vw" />
              </div>
              {/* The second view is a landscape photograph in an upright frame:
                  it is drawn about twice as wide as the frame, which is the
                  width `sizes` states, and `backPos` says which part of it
                  shows. The main frame is nearly the photographs' own shape
                  and stays centred. */}
              {h.back && (
                <div className="wws-second">
                  <Image
                    src={h.back}
                    alt={h.backAlt ?? h.alt}
                    fill
                    sizes="(max-width: 900px) 72vw, 36vw"
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
        <Link className="btn btn-ink" href="/plan">
          Request details <Arrow />
        </Link>
      </section>
    </>
  );
}
