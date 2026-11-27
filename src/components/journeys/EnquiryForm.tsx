'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useId, useRef, useState } from 'react';
import { failureMessage, postForm, privacyConsent } from '@/lib/forms';
import { track } from '@/lib/analytics';
import { readFirstTouch } from '@/lib/attribution';
import { availability } from '@/lib/availability';
import { site } from '@/lib/site';
import { RateIcon, type RateIconName } from './RateIcon';
import './plan-enquiry.css';

const PARTY_OPTIONS = ['Couple', 'Friends', 'Family', 'Solo'] as const;
const NOT_SURE = 'Not sure yet';

/**
 * idle → sending → one of:
 *   sent        the API accepted it AND forwarded it (`delivered: true`)
 *   undelivered the API accepted it but no delivery is configured
 *               (`delivered: false`) — nothing reached anyone, so we say so
 *               and hand the reader a prefilled email instead
 *   error       refused (422/429) or the provider failed (502)
 */
type Status = 'idle' | 'sending' | 'sent' | 'undelivered' | 'error';
type Path = 'departure' | 'private';

/** A journey as the form offers it: a card with its photograph. */
export type EnquiryJourney = {
  slug: string;
  title: string;
  /** '13 days · Lucerne to Milan' */
  line: string;
  img?: string;
  alt?: string;
};

export type EnquiryFormProps = {
  /** The journeys a visitor can join, as cards. */
  journeys: EnquiryJourney[];
  /** The countries a private journey can go to, as chips. */
  destinations: string[];
  /** Marc's portrait, beside "A personal reply". */
  portrait?: { src: string; alt: string };
  /**
   * The way and the journey the address asked for, read on the server, so
   * the first paint already shows them (a private-travel link opens on
   * "Design a private journey", not on "Join a departure" for a moment).
   */
  initialPath?: Path;
  initialJourney?: string;
};

const consentName = `${privacyConsent.before} ${privacyConsent.policy.label}`;

/**
 * Plan your journey: the page's opening, after the client's reference (the
 * design sample "Plan your journey", November 2026). A large "Let's talk."
 * sits behind the section. On the left, the title, the line and the two
 * ways to travel as large pill choices (join a departure, or design a
 * private journey), with Marc's portrait and the ways to reach us. On the
 * right, a frosted card: the chosen way and a progress rule that fills as
 * the reader writes, underlined fields, "Traveling as" as a segmented
 * control, guests as a stepper, then the journeys as photograph cards with
 * the minimum-group note, Marc's Booking Now wording (to join a departure;
 * his review of 23 Nov 2026), or the destinations as chips with the lead-time
 * note (for a private journey), the Privacy Policy tick box and a round send
 * button.
 * Sent, the card thanks the reader and repeats what they asked for.
 *
 * A link to /plan?journey=swiss-elegance#contact arrives with that journey
 * chosen; every private-travel link (PRIVATE_TRAVEL_HREF,
 * /plan?travel=private#contact) arrives on "Design a private journey": the
 * Private Travel form (Marc's review of 23 Nov 2026). The sending, the tick
 * box, the honeypot and the undelivered fallback are as before: the browser
 * checks the name and the email; nothing sends until the box is ticked; the
 * confirmation never claims more than the server confirmed.
 */
export function EnquiryForm({
  journeys,
  destinations,
  portrait,
  initialPath = 'departure',
  initialJourney,
}: EnquiryFormProps) {
  const id = useId();
  const [path, setPath] = useState<Path>(initialPath);
  const [journey, setJourney] = useState(
    journeys.find((j) => j.slug === initialJourney)?.slug ?? journeys[0]?.slug ?? '',
  );
  // The private way was asked for by the address (not chosen on the page):
  // once the address no longer asks for it (Back), the form goes back to
  // joining a departure.
  const pathFromAddress = useRef(initialPath === 'private');
  const [where, setWhere] = useState<string[]>([]);
  const [party, setParty] = useState<string>('Couple');
  const [guests, setGuests] = useState(2);
  const [filled, setFilled] = useState({ name: false, email: false, when: false });
  const [status, setStatus] = useState<Status>('idle');
  const [errorText, setErrorText] = useState('');
  const [summary, setSummary] = useState('');
  const [mailto, setMailto] = useState('');
  const doneRef = useRef<HTMLHeadingElement>(null);
  const [consent, setConsent] = useState(false);
  const [consentTried, setConsentTried] = useState(false);
  const consentRef = useRef<HTMLInputElement>(null);
  const consentErrorId = `${id}-consent-error`;
  const consentMissing = consentTried && !consent;

  /* The address chooses the way: `travel=private` opens the private journey,
     a journey named in it opens the form on that journey (AddressChoice). */
  const choose = useCallback(
    (travel: string | null, slug: string | null) => {
      const named = !!slug && journeys.some((j) => j.slug === slug);
      if (travel === 'private') {
        setPath('private');
        pathFromAddress.current = true;
      } else if (named || pathFromAddress.current) {
        setPath('departure');
        pathFromAddress.current = false;
      }
      if (named && slug) setJourney(slug);
    },
    [journeys],
  );

  useEffect(() => {
    if (status === 'sent' || status === 'undelivered') doneRef.current?.focus();
  }, [status]);

  const isDep = path === 'departure' && journeys.length > 0;
  const chosen = journeys.find((j) => j.slug === journey);
  const steps = [filled.name, filled.email, filled.when, isDep ? !!chosen : where.length > 0];
  const progress = 20 + steps.filter(Boolean).length * 20;

  const toggleWhere = (w: string) =>
    setWhere((c) => (c.includes(w) ? c.filter((x) => x !== w) : [...c, w]));

  function onInput(event: React.FormEvent<HTMLFormElement>) {
    const f = event.currentTarget.elements;
    const val = (n: string) => ((f.namedItem(n) as HTMLInputElement | null)?.value ?? '').trim();
    const next = { name: !!val('name'), email: !!val('email'), when: !!val('travelWindow') };
    if (next.name !== filled.name || next.email !== filled.email || next.when !== filled.when)
      setFilled(next);
  }

  function onConsentInvalid(event: React.FormEvent<HTMLInputElement>) {
    event.preventDefault();
    setConsent(false);
    setConsentTried(true);
    const box = event.currentTarget;
    if (box.form?.querySelector('input:invalid, select:invalid, textarea:invalid') === box) {
      box.focus();
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === 'sending') return;
    const ticked = consentRef.current?.checked ?? consent;
    if (ticked !== consent) setConsent(ticked);
    if (!ticked) {
      setConsentTried(true);
      consentRef.current?.focus();
      return;
    }

    const data = new FormData(event.currentTarget);
    const field = (name: string) => {
      const value = data.get(name);
      return typeof value === 'string' ? value.trim() : '';
    };
    const title = isDep ? chosen?.title : undefined;
    const places = !isDep && where.length ? `Where: ${where.join(', ')}` : '';
    const notes = [places, field('notes')].filter(Boolean).join('\n\n');
    const guestLine = `${guests} ${guests === 1 ? 'guest' : 'guests'}`;
    setStatus('sending');

    try {
      const res = await postForm('/api/enquiry', {
        name: data.get('name'),
        email: data.get('email'),
        phone: data.get('phone'),
        guests: String(guests),
        travelWindow: data.get('travelWindow'),
        heardFrom: data.get('heardFrom'),
        notes,
        party,
        journey: title,
        consent: ticked,
        source: readFirstTouch(),
        website: data.get('website'),
      });
      if (res.ok) {
        let delivered = false;
        try {
          const body: unknown = await res.json();
          delivered =
            !!body && typeof body === 'object' && 'delivered' in body && body.delivered === true;
        } catch {
          delivered = false;
        }
        track('enquiry_sent', { journey: title ?? 'private', delivered });
        setSummary(
          [
            title ??
              (where.length ? `A private journey to ${where.join(', ')}` : 'A private journey'),
            party,
            guestLine,
            field('travelWindow'),
          ]
            .filter(Boolean)
            .join(' · '),
        );
        if (delivered) {
          setStatus('sent');
        } else {
          const lines = {
            Name: field('name'),
            Email: field('email'),
            Phone: field('phone'),
            Journey: title ?? 'A private journey',
            Where: where.join(', '),
            'Traveling as': party,
            Guests: String(guests),
            When: field('travelWindow'),
            'Heard about us': field('heardFrom'),
            Notes: field('notes'),
          };
          const body = Object.entries(lines)
            .filter(([, v]) => v)
            .map(([k, v]) => `${k}: ${v}`)
            .join('\n');
          setMailto(
            `mailto:${site.email}?subject=${encodeURIComponent(`Inquiry: ${lines.Journey}`)}&body=${encodeURIComponent(body)}`,
          );
          setStatus('undelivered');
        }
      } else {
        setErrorText(await failureMessage(res));
        setStatus('error');
      }
    } catch {
      setErrorText('');
      setStatus('error');
    }
  }

  function reset() {
    setStatus('idle');
    setFilled({ name: false, email: false, when: false });
    setConsent(false);
    setConsentTried(false);
  }

  const done = steps.filter(Boolean).length;

  return (
    <section className="pe" id="enquire" aria-labelledby={`${id}-h`}>
      <Suspense fallback={null}>
        <AddressChoice onChoose={choose} />
      </Suspense>
      {/* `#contact`, where the site's Contact and "Book a call" links land. */}
      <div id="contact" className="pe-anchor" data-no-settle />
      <p className="pe-giant" aria-hidden>
        Let’s <em>talk.</em>
      </p>

      <div className="pe-g" data-fab-clear>
        <div className="pe-side">
          <p className="pe-lab">Plan your journey</p>
          <h1 id={`${id}-h`}>Start with a conversation.</h1>
          <p className="pe-intro">
            Join one of our upcoming departures, or design a private journey on your own dates.
            Either way it begins the same way: you tell us a little, and we take it from there.
          </p>

          <div className="pe-path" role="radiogroup" aria-label="How would you like to travel">
            {PATHS.map((p) => (
              <button
                key={p.value}
                type="button"
                role="radio"
                aria-checked={path === p.value}
                className={path === p.value ? 'on' : ''}
                onClick={() => {
                  pathFromAddress.current = false;
                  setPath(p.value);
                }}
              >
                <span className="pe-pi" aria-hidden>
                  <RateIcon name={p.icon} />
                </span>
                <span className="pe-pt">
                  {p.t}
                  <small>{p.s}</small>
                </span>
                <span className="pe-pc" aria-hidden>
                  <RateIcon name="check" />
                </span>
              </button>
            ))}
          </div>

          <div className="pe-who">
            {portrait && (
              <span className="pe-av">
                <Image src={portrait.src} alt="" width={120} height={120} sizes="60px" />
              </span>
            )}
            <div>
              <b>A personal reply.</b>
              <span>From Marc and our team, within two days.</span>
            </div>
          </div>
          <ul className="pe-reach">
            <li>
              <a href={`mailto:${site.email}`}>
                <span className="pe-ri" aria-hidden>
                  <RateIcon name="mail" />
                </span>
                {site.email}
              </a>
            </li>
            {site.phone && site.phoneHref && (
              <li>
                <a href={`tel:${site.phoneHref}`}>
                  <span className="pe-ri" aria-hidden>
                    <RateIcon name="phone" />
                  </span>
                  {site.phone}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="pe-card" data-tone="light">
          {status === 'sent' || status === 'undelivered' ? (
            <div className="pe-done" role="status">
              <span className="pe-tick" aria-hidden>
                <RateIcon name="check" />
              </span>
              <h2 ref={doneRef} tabIndex={-1}>
                {status === 'sent' ? 'Thank you. Marc will be in touch.' : 'One more step, please.'}
              </h2>
              <p className="pe-sum">{summary}</p>
              {status === 'sent' ? (
                <p>
                  We reply within two days. Nothing is held and nothing is committed until you have
                  spoken with us.
                </p>
              ) : (
                <>
                  <p>
                    Your details were not sent to us automatically. Please email them to{' '}
                    {site.email}: the button below opens a message with them already written.
                  </p>
                  <a className="pe-send" href={mailto}>
                    <span className="pe-si" aria-hidden>
                      <RateIcon name="mail" />
                    </span>
                    Email your inquiry
                  </a>
                </>
              )}
              {status === 'sent' && (
                <button type="button" className="pe-again" onClick={reset}>
                  Send another inquiry
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="pe-head">
                <span className="pe-hi" aria-hidden>
                  <RateIcon name={isDep ? 'group' : 'compass'} />
                </span>
                <div className="pe-steps">
                  <b>{isDep ? 'Join a departure' : 'Design a private journey'}</b>
                  <span>Tell us a little; it takes two minutes.</span>
                </div>
                <span className="pe-count" aria-hidden>
                  {done} / {steps.length}
                </span>
              </div>
              <div className="pe-bar" aria-hidden>
                <i style={{ width: `${progress}%` }} />
              </div>

              <form
                className="pe-form"
                onSubmit={onSubmit}
                onInput={onInput}
                method="post"
                action="#contact"
              >
                <noscript>
                  <p className="pe-full">
                    This form needs JavaScript to send. Please email{' '}
                    <a href={`mailto:${site.email}`}>{site.email}</a> instead.
                  </p>
                </noscript>

                <Group n="01" t="About you" />
                <Text id={`${id}-n`} icon="single" label="Name">
                  <input
                    id={`${id}-n`}
                    name="name"
                    required
                    maxLength={200}
                    autoComplete="name"
                    placeholder="Your name"
                  />
                </Text>
                <Text id={`${id}-e`} icon="mail" label="Email">
                  <input
                    id={`${id}-e`}
                    name="email"
                    type="email"
                    required
                    maxLength={254}
                    pattern="[^\s@]+@[^\s@]+\.[^\s@]{2,}"
                    title="An address like name@example.com"
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </Text>
                <Text id={`${id}-p`} icon="phone" label="Phone" optional>
                  <input
                    id={`${id}-p`}
                    name="phone"
                    type="tel"
                    maxLength={40}
                    autoComplete="tel"
                    placeholder="+1 305 000 0000"
                  />
                </Text>
                <Text id={`${id}-w`} icon="calendar" label="When would you like to travel">
                  <input
                    id={`${id}-w`}
                    name="travelWindow"
                    maxLength={120}
                    placeholder="September 2027, or flexible"
                  />
                </Text>

                <Group n="02" t="Your party" />
                <fieldset className="pe-f">
                  <legend>Traveling as</legend>
                  <div className="pe-seg">
                    {PARTY_OPTIONS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        aria-pressed={party === o}
                        className={party === o ? 'on' : ''}
                        onClick={() => setParty(o)}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="pe-f">
                  <legend>Guests</legend>
                  <div className="pe-step">
                    <button
                      type="button"
                      aria-label="Fewer guests"
                      disabled={guests <= 1}
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                    >
                      −
                    </button>
                    <output aria-live="polite" aria-label={`${guests} guests`}>
                      {guests}
                    </output>
                    <button
                      type="button"
                      aria-label="More guests"
                      disabled={guests >= site.maxGuests}
                      onClick={() => setGuests((g) => Math.min(site.maxGuests, g + 1))}
                    >
                      +
                    </button>
                  </div>
                </fieldset>

                <Group n="03" t="Your journey" />
                {isDep ? (
                  <fieldset className="pe-f pe-full">
                    <legend>Journey of interest</legend>
                    <div className="pe-jsel">
                      {journeys.map((j) => (
                        <label key={j.slug} className={`pe-jc${journey === j.slug ? ' on' : ''}`}>
                          <input
                            className="sr-only"
                            type="radio"
                            name="journey"
                            value={j.slug}
                            checked={journey === j.slug}
                            onChange={() => setJourney(j.slug)}
                          />
                          {j.img && (
                            <Image src={j.img} alt="" width={128} height={128} sizes="64px" />
                          )}
                          <span className="pe-jt">
                            {j.title}
                            <small>{j.line}</small>
                          </span>
                          <span className="pe-jk" aria-hidden>
                            <RateIcon name="check" />
                          </span>
                        </label>
                      ))}
                    </div>
                    <p className="pe-info">
                      <span className="pe-ii" aria-hidden>
                        <RateIcon name="group" />
                      </span>
                      <span>
                        <b>Minimum group.</b> {availability['booking-now'].wording}
                      </span>
                    </p>
                  </fieldset>
                ) : (
                  <fieldset className="pe-f pe-full">
                    <legend>Where would you like to go</legend>
                    <div className="pe-chips">
                      {[...destinations, NOT_SURE].map((w) => (
                        <button
                          key={w}
                          type="button"
                          aria-pressed={where.includes(w)}
                          className={where.includes(w) ? 'on' : ''}
                          onClick={() => toggleWhere(w)}
                        >
                          <RateIcon name={where.includes(w) ? 'check' : 'route'} />
                          {w}
                        </button>
                      ))}
                    </div>
                    <p className="pe-info">
                      <span className="pe-ii" aria-hidden>
                        <RateIcon name="clock" />
                      </span>
                      <span>
                        <b>Lead time.</b> Six months is comfortable; less is often possible.
                      </span>
                    </p>
                  </fieldset>
                )}

                <Group n="04" t="A little more" />
                <Text id={`${id}-h`} icon="chat" label="How did you hear about us">
                  <input
                    id={`${id}-h`}
                    name="heardFrom"
                    maxLength={120}
                    placeholder="Instagram, a friend, Google…"
                  />
                </Text>
                <Text id={`${id}-x`} icon="pen" label="Anything we should know" full>
                  <textarea
                    id={`${id}-x`}
                    name="notes"
                    rows={2}
                    maxLength={1800}
                    placeholder="Dates, dietary notes, a milestone you’re celebrating…"
                  />
                </Text>

                <div className="pe-consent pe-full">
                  <label>
                    <input
                      ref={consentRef}
                      type="checkbox"
                      name="consent"
                      required
                      autoComplete="off"
                      aria-label={consentName}
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      onInvalid={onConsentInvalid}
                      aria-invalid={consentMissing}
                      aria-describedby={consentMissing ? consentErrorId : undefined}
                    />
                    <span>
                      {privacyConsent.before}{' '}
                      <a href={privacyConsent.policy.href} target="_blank" rel="noopener">
                        {privacyConsent.policy.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </span>
                  </label>
                  <p id={consentErrorId} aria-live="polite" className="pe-err">
                    {consentMissing ? privacyConsent.unticked : ''}
                  </p>
                </div>

                {/* Honeypot: a field no person sees or fills. */}
                <div hidden aria-hidden>
                  <label>
                    Leave this empty
                    <input name="website" type="text" tabIndex={-1} autoComplete="off" />
                  </label>
                </div>

                <div className="pe-end pe-full">
                  <ul className="pe-promise">
                    <li>
                      <RateIcon name="shield" /> Holds nothing, commits you to nothing
                    </li>
                    <li>
                      <RateIcon name="single" /> A personal reply, never a newsletter
                    </li>
                  </ul>
                  <button className="pe-send" type="submit" aria-disabled={status === 'sending'}>
                    <span className="pe-si" aria-hidden>
                      <RateIcon name="arrow" />
                    </span>
                    {status === 'sending' ? 'Sending' : 'Send inquiry'}
                  </button>
                </div>
                <p role="alert" aria-live="assertive" className="pe-err pe-full">
                  {status === 'error'
                    ? errorText || `That didn’t send. Please try again, or email ${site.email}.`
                    : ''}
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Reads the way the address asks for and hands it to the form, on arrival
 * and whenever the address changes on this page (a private-travel link in the
 * menu or the footer, followed from /plan itself). In its own Suspense
 * boundary, so the form around it is still drawn on the server.
 */
function AddressChoice({
  onChoose,
}: {
  onChoose: (travel: string | null, journey: string | null) => void;
}) {
  const params = useSearchParams();
  const travel = params.get('travel');
  const journey = params.get('journey');
  useEffect(() => {
    onChoose(travel, journey);
  }, [travel, journey, onChoose]);
  return null;
}

/** The two ways to travel, each with its icon. */
const PATHS: { value: Path; t: string; s: string; icon: RateIconName }[] = [
  {
    value: 'departure',
    t: 'Join a departure',
    s: 'Take a place on a journey already planned',
    icon: 'group',
  },
  {
    value: 'private',
    t: 'Design a private journey',
    s: 'Only your names on the list, on your dates',
    icon: 'compass',
  },
];

/** A numbered part of the form: "01 About you". */
function Group({ n, t }: { n: string; t: string }) {
  return (
    <p className="pe-grp pe-full">
      <span>{n}</span>
      {t}
    </p>
  );
}

/** A text field: its serif label above, its icon at the start of the underline. */
function Text({
  id,
  icon,
  label,
  optional,
  full,
  children,
}: {
  id: string;
  icon: RateIconName;
  label: string;
  optional?: boolean;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`pe-f${full ? ' pe-full' : ''}`}>
      <label htmlFor={id}>
        {label}
        {optional && <small>optional</small>}
      </label>
      <div className="pe-in">
        <RateIcon name={icon} className="pe-fi" />
        {children}
      </div>
    </div>
  );
}
