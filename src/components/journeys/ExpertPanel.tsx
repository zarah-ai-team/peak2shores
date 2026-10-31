import Image from 'next/image';
import { site, whatsappHref } from '@/lib/site';
import './collection.css';

/**
 * "Not sure which one is yours?" — a large line over a photograph, and beside
 * it a frosted card with every way to reach a travel designer, one row each.
 * Rows appear only for the channels set in `site.ts`.
 */
export function ExpertPanel() {
  const wa = site.whatsapp ? whatsappHref() : null;
  const rows = [
    site.phone && site.phoneHref
      ? { label: 'Call', value: site.phone, href: `tel:${site.phoneHref}` }
      : null,
    wa ? { label: 'WhatsApp', value: 'Message us', href: wa } : null,
    { label: 'Book a call', value: 'Choose a time', href: site.bookingUrl ?? '/plan#contact' },
    { label: 'Email', value: site.email, href: `mailto:${site.email}` },
  ].filter((r): r is { label: string; value: string; href: string } => Boolean(r));

  return (
    <section className="jx jx-exp" id="expert" aria-labelledby="jx-exp-h">
      <Image
        className="fill"
        src="/images/home/way-group-lucerne-tower.jpg"
        alt=""
        fill
        sizes="100vw"
      />
      <div className="big">
        <p className="lab">Plan your journey</p>
        <h2 id="jx-exp-h">Not sure which one is yours?</h2>
      </div>
      <div className="glass">
        <p className="lab">Speak to an expert</p>
        <p className="say">
          Our travel designers will help you choose the right journey — or design one around you.
        </p>
        {rows.map((r) => (
          <a
            key={r.label}
            className="row"
            href={r.href}
            {...(r.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            {r.label}
            <span>{r.value}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
