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
 * Where we stay (2 Nov notes): the homepage's "Where we stay" button opens
 * here. Each place Marc names, in his words, with both of its photographs:
 * the hotel's own frame and a second view of it. Hotel photographs are the
 * hotels' own; their credits live in the footer only.
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
            <div className="wws-photos">
              <div className="wws-main">
                <Image src={h.img} alt={h.alt} fill sizes="(max-width: 900px) 100vw, 40vw" />
              </div>
              {h.back && (
                <div className="wws-second">
                  <Image
                    src={h.back}
                    alt={h.backAlt ?? h.alt}
                    fill
                    sizes="(max-width: 900px) 50vw, 18vw"
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
