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

Everything visual comes from `src/app/globals.css`. The tokens are declared once
in `@theme` and every colour, font and rule reads from them.

| Token                | Value     | Role                                                 |
| -------------------- | --------- | ---------------------------------------------------- |
| `--color-ivory`      | `#f4f1ea` | The ground                                           |
| `--color-panel`      | `#ede9df` | Tinted sections and row hovers                       |
| `--color-ink`        | `#1e1f1d` | Type, and the dark fields                            |
| `--color-body`       | `#3a3b38` | Body copy                                            |
| `--color-muted`      | `#6f6a60` | Metadata, caps labels — 4.8:1 on ivory (AA at 10px)  |
| `--color-acqua`      | `#0cc0df` | A hairline, a hover over a photograph — never a field |
| `--color-acqua-deep` | `#0b9fb8` | Hairlines on the light ground. Not text-safe.        |
| `--color-acqua-text` | `#06758a` | The only acqua allowed as *text* on a light ground   |
| `--color-gorse`      | `#d7da5e` | A tick mark and a quote rule. Nothing else.          |
| `--color-line`       | 18% ink   | Every rule in the layout                             |
| `--nav-h`            | 68/88px   | The fixed header. Every offset that clears it reads this. |

Georgia carries the emotion (`--font-display`, a system serif with its italic); Poppins is
demoted to metadata and interface (`--font-ui`). Zero corner radius anywhere,
1px rules, flush-left type, editorial numbering — as the canvas' own
exploration sheet specified.

Type classes: `.display` (journey heroes) · `.page-title` (index pages) · `.h1`–`.h5`
· `.lead` (italic Georgia) · `.prose-body` · `.kicker` / `.kicker-sm`.
Layout classes: `.gutter` (the 56px page inset, tightened on small screens),
`.editorial-grid` (the 140px numbered rail + two columns), `.editorial-grid--wide`.
Shared blocks: `<PageTitle>`, `<FactList>`, `<DarkCta>`, `<SectionLabel>`, `<MetaItem>`.

Focus is ink on the light ground and ivory on ink or a photograph. Anchor
targets clear the header through one rule — `scroll-padding-top` on `html` —
and never add their own `scroll-margin`.

## Motion

One runtime, in `src/components/motion/MotionProvider.tsx`: `LazyMotion` with
the `domAnimation` feature set (no drag, no layout projection) and
`MotionConfig reducedMotion="user"`. Every animated element is an `m.*`
component; `strict` mode throws in development if a bare `motion.*` sneaks in
and drags the full bundle back.

Timings live in `src/lib/motion.ts`: interface feedback 200–450ms, editorial
reveals ~1.1s, page transitions 720ms, signature moments 1.4s+. No springs.

- `<Reveal>` / `<RevealGroup>` + `<RevealItem>` — the scroll reveal and its stagger.
- `<TextReveal>` — masked line reveal for display type. Hero headlines animate in
  **CSS** (`.line-rise`), not JavaScript: that headline is usually the largest
  contentful paint and must not depend on a bundle loading.
- `<Frame>` — the image primitive. One viewport observer, on an unclipped
  layer, lifts the tonal curtain and settles the picture together (a clip-path
  hidden state was never counted as visible by Chrome, so the reveal never
  fired and the lazy photograph beneath it never loaded); scroll-tied parallax exists only on frames that
  ask for it (`parallax={n}`), so a page with forty photographs has a handful of
  scroll subscriptions, not forty.
- Hero carousel — all three slides are in the tree from the start (the waiting
  ones fetched at low priority), cross-fading rather than sliding. Autoplay
  pauses on hover and focus, stops with the pause control, and never starts
  under reduced motion; the slide rules always work.
- `<ScrollProgress>` — the acqua rule across the top. Driven by the scroll event,
  not the animation library: it is an indicator and must track the scrollbar.
- `<Preloader>` — PEAKS → 2 → SHORES. Resolves on the window's own `load`, floored
  at 900ms and capped at 1800ms, once per session. It never invents a delay.
- `<PageTransition>` — the incoming page rises under a mask. The **first** page of
  a session is deliberately not animated.

**Reduced motion and no-JavaScript are handled by the stylesheet, never by
rendering different markup.** Motion serialises each block's hidden start state
into the server HTML; the `[data-reveal]` and `[data-parallax]` rules in
`globals.css` hand readers with reduced motion — and anyone whose bundle fails —
the finished layout over the top of it. The tree is identical for every reader,
so server and client always hydrate cleanly.

## Photography

**The images currently on the site are comps, not art direction.** No photography
was shot for Peaks2Shores, so every frame except Marc's portrait is filled with a
freely-licensed image pulled from Wikimedia Commons by keyword
(`node scripts/fetch-stock.mjs`). Sources, authors and licences are recorded in
`public/images/credits.json`, which generates both `public/images/CREDITS.md`
and the public **`/credits`** page linked from the footer — most of the files are
CC BY or CC BY-SA and require that visible attribution while they are in use.

Still to settle before launch:

- **Model releases.** A copyright licence is not a model release. Selection avoids
  portraits deliberately, but check any frame with a recognisable face.
- **Replacing the comps.** Once commissioned photography lands, delete
  `credits.json`, the `/credits` route and the footer link together.

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

`src/lib/journeys.ts` and `src/lib/content.ts` hold every word on the site, lifted
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
