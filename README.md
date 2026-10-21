# Peaks2Shores

The production website, built from the approved design canvas
(`Peak2Shores.zip` → `_design-reference/`).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (runs `images` first)
npm run start    # serve the production build
npm run lint     # eslint
npm run typecheck
npm run format
npm run images   # wire public/images/* into the media registry
```

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Motion 12.

---

## The design system

Everything visual comes from `src/app/globals.css`. Tokens are declared once in `@theme`.
The binding spec is `docs/redesign/DESIGN-SPEC.md`. The component reference is
`docs/redesign/PRIMITIVES.md`.

| Token                  | Value                 | Role                                                                |
| ---------------------- | --------------------- | ------------------------------------------------------------------- |
| `--color-ivory`        | `#f4f1ea`             | Main paper ground                                                   |
| `--color-panel`        | `#ede9df`             | Second paper                                                        |
| `--color-stone`        | `#d9d0bf`             | Founder blocks, image grounds (labels in `stone-text`)              |
| `--color-ink` / `body` | `#1e1f1d` / `#3a3b38` | Headlines / body copy on paper                                      |
| `--color-muted`        | `#6f6a60`             | Kickers on ivory/panel only                                         |
| `--color-forest`       | `#1d2a25`             | Primary dark ground                                                 |
| `--color-forest-deep`  | `#151e1a`             | Footer, mobile menu, globe band                                     |
| `--color-charcoal`     | `#232422`             | Secondary dark ground (never next to forest)                        |
| `--color-acqua`        | `#8cc2b8`             | Sea-glass: hairlines/hover on dark or photo; text-safe on dark only |
| `--color-acqua-deep`   | `#5f948c`             | Hairlines on paper. Not text                                        |
| `--color-acqua-text`   | `#2f6b64`             | The only acqua as text on paper                                     |
| `--color-gorse`        | `#b39e64`             | Muted brass: tick, quote rule, preloader rule. Never text on paper  |
| `--color-error`        | `#8a3b2e`             | Errors on paper (`error-dark` `#e8a594` on dark)                    |
| `--nav-h`              | 68/84px               | The fixed header. Every offset that clears it reads this.           |

Type is set in two faces, both loaded with `next/font`:

- **Cormorant Garamond** (`--font-display`). Weight 500 for headings, 600 for `.h5` and numerals, and 400 italic for `.lead` and `.quote`.
- **Manrope** (`--font-ui`). Weight 400 for body text, 500 for labels and buttons.

Corners are square everywhere and rules are 1px. Type classes are `.display`, `.h1`,
`.page-title`, `.h2`–`.h5`, `.lead`, `.quote`, `.numeral`, `.prose-body(-sm)`,
`.kicker(-sm)`, `.nav-label` and `.meta`.

Layout uses `.container-site` (max 1680px plus the 20/40/56/72px gutter) and `.grid-site`
(4 / 8 / 12 columns, 12 from `lg`). Spacing utilities are `py-section`, `py-section-sm`,
`mb-block` and `gap-stack`. `.editorial-grid` is legacy.

Shared blocks: `Section`/`Container`, `PhotoHero`, `PageTitle`, `Frame`, `Rail`,
`StatusTag`, `Quote`, `FactList`, `MetaItem`, `SectionLabel`, `DarkCta`, `Button`/`ButtonLink`
and `NewsletterForm`.

Dark grounds set `data-tone="dark"`. Kickers, body text, rule links, fields and focus
rings then pick their dark treatment in CSS.

Focus rings are 2px. They are ink on paper and sea-glass on dark grounds and photographs.
Anchor targets clear the header through one rule, `scroll-padding-top` on `html`, and
never add their own `scroll-margin`.

## Motion

One runtime, in `src/components/motion/MotionProvider.tsx`: `LazyMotion` with
the `domAnimation` feature set (no drag, no layout projection) and
`MotionConfig reducedMotion="user"`. Every animated element is an `m.*`
component; `strict` mode throws in development if a bare `motion.*` sneaks in.

Timings live in `src/lib/motion.ts`:

- interface feedback 250–400ms
- reveals 0.9s (16px travel)
- page transitions 0.6s
- signature moments 1.2s

Nothing runs longer than 1.4s except the 9s hero drift. There are no springs, no
scroll-jacking and no pinned horizontal scroll.

- `<Reveal>` / `<RevealGroup>` + `<RevealItem>`: the scroll reveal and its stagger (60ms).
- `<TextReveal>`: masked line reveal for display type. Hero headlines animate in
  **CSS** (`.line-rise`, 1.0s, lines 90ms apart), not JavaScript. That headline is
  usually the largest contentful paint and must not depend on a bundle loading.
- `<Frame>`: the image primitive. A tonal curtain lifts over 1.2s while the picture
  settles from 1.04 to 1 over 1.6s. One viewport observer sits on an unclipped layer,
  and scroll-tied parallax runs only on frames that ask for it (`parallax={n}`).
- `<Rail>`: native `overflow-x` with scroll-snap. The prev/next buttons scroll by one item.
- `<ScrollProgress>`: a 1px rule across the top. It is sea-glass over a photograph and
  the hairline step on paper. It is driven by the scroll event.
- `<Preloader>`: PEAKS → 2 → SHORES.
  - It resolves on the window's `load` event, with a floor of 600ms and a cap of 1400ms.
  - It plays once per 24h.
  - On exit, the ivory cover lifts away.
  - The inline boot script in `layout.tsx` sets `data-preload` before first paint and
    clears it after 2.4s if the bundle never arrives.
- `<PageTransition>`: the incoming page fades and rises 12px over 600ms. The **first**
  page of a session is deliberately not animated.

**Reduced motion and no-JavaScript are handled by the stylesheet, never by
rendering different markup.** Motion serialises each block's hidden start state
into the server HTML. The `[data-reveal]`, `[data-curtain]`, `[data-parallax]` and
`[data-menu-item]` rules in `globals.css` hand readers with reduced motion, and anyone
whose bundle fails, the finished layout. The tree is identical for every reader.

## Photography

**The images on the site are licensed stock, not commissioned work.** No photography
was shot for Peaks2Shores. Every frame except Marc's portrait is a hand-picked
Unsplash photograph (Unsplash License — commercial use allowed, no attribution
required), apart from two Wikimedia Commons frames (`d8`, `ce-9`, CC BY-SA 4.0,
attribution required). The picks live in `scripts/photography-manifest.json`
(slot → Unsplash id); `node scripts/source-photography.mjs` downloads them,
refuses anything not under the Unsplash License, and records provenance in
`public/images/credits.json`, which generates `public/images/CREDITS.md` and the
public **`/credits`** page linked from the footer.

Still to settle before launch:

- **Commissioned photography.** `PHOTOGRAPHY-BRIEF.md` lists each slot's status
  and a "Commission first" list (heroes, featured journeys, hotels and more).
- **Model releases.** A copyright licence is not a model release. Selection avoids
  portraits deliberately, but check any frame with a recognisable face.
- **Location tags.** Unsplash locations are the photographers' own tags, recorded
  as published. A few generic slots use frames from elsewhere (noted in the brief).
- **Keep `/credits`** while any Commons frame is in use; it can go only once
  every credited frame is replaced.

Every frame is registered in **`src/lib/media.ts`** with its art direction.
To ship a real photograph, name the file after the slot key, drop it in, sync:

```bash
cp amalfi-hero.jpg public/images/home-hero.jpg
npm run images
```

That writes `src/lib/media.generated.ts` (Prettier-clean, only when it changes),
which `getMedia()` merges over the registry, and refreshes
`PHOTOGRAPHY-BRIEF.md` — the shot list to hand a photographer. `<Frame>`
switches from the placeholder to `next/image` on its own. A file whose name
matches no slot is ignored with a warning, and the script fails loudly if its
scan of the registry ever disagrees with an independent key count.

Alt text falls back to the slot's short `label`; set `alt` on a slot for
something better, and pass `decorative` to a `<Frame>` inside a link or beside
text that already says what the picture shows.

`public/brand/` holds the logo (900px PNG) and Marc's portrait (WebP with alpha,
181KB). App icons and the 1200×630 share image live in `src/app/` and were
generated from those sources.

## Content

`src/lib/journeys.ts` and `src/lib/data/copy.ts` (served through `src/lib/content`) hold every word on the site, lifted
from the approved canvas. **Nothing factual has been invented.** The canvas
carried a placeholder phone number; it is `null` in `src/lib/site.ts` and every
phone link on the site appears when a real one is set.

- Only *Amalfi, Slowly* has a full write-up. The others carry their summary data
  and either a working day-by-day or an explicit "in preparation" state.
- The journal entries are flagged `draft: true` until a piece is written.
- Index pages receive `JourneySummary` objects, not whole journeys — the
  itineraries never cross to the browser.

## Forms and the API

`POST /api/subscribe` and `POST /api/enquiry` share the guards in `src/lib/api.ts`:
same-origin only, JSON only, a 16KB body cap, field-length caps, an allow-list
for the enquiry's party/journey/guest fields, a honeypot, and an in-memory
per-IP rate limit (5 per minute). The limiter is right for a single
`next start` instance; on a multi-instance or serverless host put a platform
limiter in front. Logs record that a submission arrived, never who sent it.

Delivery is the one thing left to wire: the `INTEGRATION POINT` comment in each
route marks where the mailing provider and CRM go.

## Security headers

`next.config.mjs` sets `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, `X-Frame-Options` and a `Content-Security-Policy` of
`frame-ancestors 'none'`. There is deliberately no script CSP: Next's inline
hydration scripts, the inline boot script and Motion's inline styles would need
nonces (forcing every page dynamic) and `'unsafe-inline'` regardless, and the
site renders no user content. HSTS belongs to the TLS terminator.

## SEO

Every page sets its metadata through `pageMetadata()` in `src/lib/seo.ts`, which
fills in the Open Graph and Twitter fields Next would otherwise drop when a page
overrides them. The share image is `src/app/opengraph-image.jpg` (Next's file
convention — a file in `public/` is not picked up). `Organization` and `WebSite`
JSON-LD are emitted on every page; journey pages add `TouristTrip` (with an
`ItemList` itinerary and a unit-priced `Offer`) and `BreadcrumbList`. All
JSON-LD goes through `jsonLd()`, which escapes `<`.

Set the real production origin in `src/lib/site.ts` (`url`) before deploying —
canonical URLs, Open Graph and the sitemap all read from it.

## Pages

| Route              | Notes                                                        |
| ------------------ | ------------------------------------------------------------ |
| `/`                | The full canvas homepage, sections 01–09                     |
| `/journeys`        | Filterable index (destination / when / who / what inspires)   |
| `/journeys/[slug]` | Statically generated per journey                              |
| `/destinations`    | Includes the Peaks → Shores signature section                 |
| `/experiences`     | Taste · Meet · Discover · Move · Stay                         |
| `/our-story`       | Marc, and the four pillars                                    |
| `/journal`         | Editorial index, entries marked in preparation                |
| `/plan`            | Private travel, this year's departures, the enquiry form      |
| `/credits`         | Photography attribution, generated from the manifest          |

Plus `not-found`, `error`, `sitemap.xml`, `robots.txt`, icons and share images.

## Known limits

- `npm audit` reports two advisories in the copy of `postcss` bundled inside
  `next` 15.5. They concern build-time CSS tooling, not anything served, and
  the only fix is the Next 16 major. Revisit on the next framework upgrade.
- The rate limiter is per process (see above).
- `Footer`'s copyright year is baked at build time on static pages.
