# Architecture — content, SEO and the form API

Owner: architecture/backend (Agent 6). Status: provider in place; pages still
read the legacy modules and move over in the next wave.

---

## 1. How to use the content provider (page agents: start here)

**One import path:** `@/lib/content`

```ts
import {
  getJourneySummaries,
  getJourneyBySlug,
  getJourneySlugs,
  getFeaturedJourneys,
  getRelatedJourneys,
  getDestinations,
  getExperiences,
  getPublishedArticles,
  getForthcomingArticles,
  getSiteSettings,
  getNavigation,
  getPageContent,
  pageMetadata,
  jsonLd,
  type JourneySummary,
} from '@/lib/content';
```

Rules:

1. **Server only, by convention.** Call the getters in server components,
   `generateMetadata`, `generateStaticParams`, route handlers, sitemap/robots.
   Never in a `'use client'` file (the `server-only` package is not installed,
   so the build will not stop you). Pass data to client components as props.
2. **Summaries to the client.** Give client components `JourneySummary`, never
   `Journey` — itineraries, hotels and quotes stay on the server.
3. **Everything is async.** `await` it. This is what lets a CMS slot in later.
4. **Drafts are filtered for you.** Never pass `{ includeDrafts: true }` from a
   public page.
5. **Guest quotes are verified-only.** `journey.detail.quotes[]` carries
   `verified?: boolean`. Journeys returned by the provider contain only
   verified quotes — none today — so render the Guests section only when
   `journey.detail.quotes.length > 0`. Never read quotes from `@/lib/journeys`
   directly.
6. **Photo heroes.** The header turns transparent on `isHeroRoute()`
   (`@/lib/site`): `/`, `/destinations`, `/journeys/[slug]`. If a
   page gains or loses a photo hero, tell Agent 6 so the list changes with it.
7. **Keep `export const revalidate = 3600`** on every page that lists journeys
   (home, /journeys, /journeys/[slug], /destinations, /plan, /links) so a
   scheduled journey appears within the hour of its `publishAt`.

### Examples

Index page (client explorer receives summaries):

```tsx
// src/app/journeys/page.tsx
import { getJourneySummaries, pageMetadata } from '@/lib/content';
import { JourneyExplorer } from '@/components/journeys/JourneyExplorer';

export const revalidate = 3600;
export const metadata = pageMetadata({ title: 'Journeys', description: '…', path: '/journeys' });

export default async function JourneysPage() {
  const journeys = await getJourneySummaries();
  return <JourneyExplorer journeys={journeys} />;
}
```

Detail page:

```tsx
// src/app/journeys/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getJourneyBySlug, getJourneySlugs, getRelatedJourneys, pageMetadata } from '@/lib/content';

export const revalidate = 3600;
// dynamicParams stays at its default (true): a journey whose publishAt passes
// after the build is rendered on first request. Before then getJourneyBySlug
// returns null and the page 404s.

export async function generateStaticParams() {
  return (await getJourneySlugs()).map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const journey = await getJourneyBySlug((await params).slug);
  if (!journey) return {};
  return pageMetadata({ title: journey.title, description: journey.lead, path: `/journeys/${journey.slug}` });
}

export default async function JourneyPage({ params }: Params) {
  const { slug } = await params;
  const journey = await getJourneyBySlug(slug);
  if (!journey) notFound();
  const related = await getRelatedJourneys(slug, 3);
  // …
}
```

Page copy:

```tsx
const { philosophy, pillars, reasons, peaksToShores, signatureHotels, founder, circle } =
  await getPageContent('home');
const { founder, pillars } = await getPageContent('our-story');
const { categories, circle } = await getPageContent('journal');
const { experiences } = await getPageContent('experiences');
const { peaksToShores } = await getPageContent('destinations');
```

Journal index (all entries are drafts today):

```tsx
const published = await getPublishedArticles(); // [] until a piece is written
const forthcoming = await getForthcomingArticles(); // teasers: render "In preparation", NO link
```

Navigation (Header/MobileMenu/Footer are client or shared components — fetch in
the layout and pass down, or keep reading `@/lib/site` until they are moved):

```ts
const { primary, cta, footer, legal } = await getNavigation();
```

### Legacy imports still work

`src/lib/content.ts` moved to `src/lib/data/copy.ts`. `@/lib/content` now
resolves to `src/lib/content/index.ts`, which re-exports every old symbol
(`philosophy`, `pillars`, `Pillar`, `reasons`, `peaksToShores`, `experiences`,
`Experience`, `signatureHotels`, `founder`, `circle`, `journalCategories`,
`journal`, `JournalEntry`). `@/lib/journeys` and `@/lib/site` are unchanged.
Client components that import these synchronous constants (PeaksToShores,
PillarsIndex) keep working; new server code should use the getters.
`@/lib/journeys` also gains `relatedJourneys(slug, n = 3)` (sync, returns
summaries) and the pure `rankRelated(all, slug, n)`.

---

## 2. Provider API

All in `src/lib/content/index.ts`. `opts?: ContentQueryOptions` is
`{ includeDrafts?: boolean; now?: Date }`.

| Function | Returns | Notes |
| --- | --- | --- |
| `getJourneys(opts?)` | `Promise<Journey[]>` | Full objects. Server use only. |
| `getJourneyBySlug(slug, opts?)` | `Promise<Journey \| null>` | null for unknown or unreleased → `notFound()` |
| `getJourneySlugs()` | `Promise<string[]>` | For `generateStaticParams`. Live only. |
| `getJourneySummaries(opts?)` | `Promise<JourneySummary[]>` | Client-safe. |
| `getFeaturedJourneys(opts?)` | `Promise<JourneySummary[]>` | `featured: true` |
| `getRelatedJourneys(slug, limit = 3, opts?)` | `Promise<JourneySummary[]>` | Shared country > shared inspirations > season; excludes self and `past` |
| `getEnquirableJourneyTitles()` | `Promise<string[]>` | Options for `<EnquiryForm journeyOptions>` |
| `getDestinations(opts?)` | `Promise<Destination[]>` | Derived per country from live journeys |
| `getDestinationBySlug(slug, opts?)` | `Promise<Destination \| null>` | slug e.g. `south-africa` (no route yet) |
| `getExperiences()` | `Promise<Experience[]>` | |
| `getExperienceBySlug(slug)` | `Promise<Experience \| null>` | |
| `getPublishedArticles(opts?)` | `Promise<JournalArticle[]>` | `!draft` and released |
| `getArticleBySlug(slug, opts?)` | `Promise<JournalArticle \| null>` | Drafts → null (no address) |
| `getForthcomingArticles()` | `Promise<ForthcomingArticle[]>` | Drafts as teasers, body stripped |
| `getJournalCategories()` | `Promise<readonly JournalCategory[]>` | |
| `getSiteSettings()` | `Promise<SiteSettings>` | `typeof site` |
| `getNavigation()` | `Promise<Navigation>` | `{ primary, cta, footer, legal }` |
| `getPageContent(page)` | `Promise<PageContentMap[K]>` | `page`: `'home' \| 'our-story' \| 'destinations' \| 'experiences' \| 'journal'` |

Re-exported for a single import path: `getMedia`, `isNew`, `journeyLabel`,
`toSummary`, `pageMetadata`, `jsonLd`.

Types (`src/lib/content/types.ts`, all re-exported): `Journey`,
`JourneySummary`, `JourneyDetail`, `JourneyStatus`, `ItineraryDay`, `Hotel`,
`Season`, `Party`, `Inspiration`, `Destination`, `Experience`,
`JournalArticle`, `ForthcomingArticle`, `JournalCategory`, `SiteSettings`,
`Navigation`, `NavItem`, `Pillar`, `HomeContent`, `OurStoryContent`,
`DestinationsContent`, `ExperiencesContent`, `JournalContent`,
`PageContentMap`, `PageKey`, `PageCopy`, `MediaKey`, `MediaSlot`, `SeoFields`,
`ContentQueryOptions`, `ContentSource`.

Not in the provider: `filterGroups` (has `match` functions, so it is not
serialisable — client components keep importing it from `@/lib/journeys`) and
`isHeroRoute` (routing, `@/lib/site`).

### Layout

```
src/lib/content/index.ts         public API + publishing rules + legacy re-exports
src/lib/content/types.ts         content models
src/lib/content/source.ts        ContentSource interface + the active source (1 line)
src/lib/content/sources/local.ts the TypeScript source
src/lib/data/copy.ts             editorial copy (was src/lib/content.ts)
src/lib/data/navigation.ts       footer legal links (copy of Footer's list)
src/lib/journeys.ts              journey catalogue (unchanged; adds journeyCatalogue)
src/lib/site.ts                  site settings + primary/cta/footer nav (unchanged)
```

---

## 3. Adding a CMS adapter

1. Create `src/lib/content/sources/<cms>.ts` exporting an object implementing
   `ContentSource` (`journeys`, `journal`, `experiences`, `siteSettings`,
   `navigation`, `pageCopy`). Map CMS documents onto the types in `types.ts`.
   Images: either map CMS assets onto existing `MediaKey` slots, or extend the
   media model (coordinate with the photography owner of `src/lib/media.ts`).
2. **Return everything, including drafts and scheduled items.** Do not filter
   in the adapter — the provider applies the rules, so they cannot drift.
   Map the CMS's own draft state onto `draft: true` (articles) and its
   scheduled-publish date onto `publishAt` (ISO 8601 with offset).
3. Fetch with `fetch(url, { next: { revalidate: 3600, tags: ['content'] } })`
   so requests are deduplicated per render and cached. A webhook route
   (`src/app/api/revalidate/route.ts`, secret in `CMS_REVALIDATE_SECRET`) can
   call `revalidateTag('content')` for instant publishing; the hourly
   revalidate remains the fallback for scheduled items.
4. Change the single line in `src/lib/content/source.ts`:
   `export const source: ContentSource = sanitySource;`
5. CMS tokens are server env vars (no `NEXT_PUBLIC_` prefix). Read them only in
   the adapter.

---

## 4. Scheduling and draft rules

- **Journeys:** visible when `publishAt` is absent or `<= now`. Before that the
  journey is absent from every list, the sitemap, llms.txt, the enquiry
  allow-list, and its URL 404s. `isNew` labels it "New" for 30 days after
  release. Status (`open | waitlist | sold-out | past`) never hides a journey.
- **Journal:** published when `draft === false` and released. Drafts have no
  address; they may appear only as unlinked "in preparation" teasers via
  `getForthcomingArticles()`. Today every entry is a draft, and there is no
  `/journal/[slug]` route. When one is added: `generateStaticParams` from
  `getPublishedArticles()`, `getArticleBySlug()` → `notFound()` on null,
  `revalidate = 3600`, add to the sitemap.
- **Legal pages:** `site.legalDraft` (true) → `robots: noindex` via
  `legalRobots` in `components/ui/LegalPage.tsx`, and excluded from the
  sitemap. Flip to false once Marc approves the wording.
- **Timing:** static pages regenerate at most hourly (ISR). A release appears
  within an hour of `publishAt`; a deploy shows it immediately.
- `includeDrafts: true` exists for a future preview route only. Such a route
  must be `dynamic = 'force-dynamic'`, protected (Next draft mode + a secret),
  and `noindex`.

---

## 5. SEO checklist

- [x] `metadataBase` = `site.url` (layout). **Set the real production origin in
      `src/lib/site.ts` before launch** — currently `https://peaks2shores.com`.
- [x] Every page uses `pageMetadata({ title, description, path, type?, noindex? })`,
      which sets canonical, OG and Twitter. `path` must start with `/`.
- [x] Share image via `src/app/opengraph-image.jpg` / `twitter-image.jpg` (file convention).
- [x] Organization + WebSite JSON-LD on every page; journeys add TouristTrip + BreadcrumbList; all via `jsonLd()`.
- [x] Sitemap: live journeys only, no drafts, legal pages only once `legalDraft` is false.
- [x] Robots: closed on previews/branch deploys (Netlify `CONTEXT`, Vercel `VERCEL_ENV`);
      search and AI-search agents always allowed; training crawlers follow `site.allowAiTraining`.
- [x] Previews also send `X-Robots-Tag: noindex, nofollow` (next.config.mjs).
- [x] llms.txt: live journeys only; no journal links to drafts.
- [x] Legacy Squarespace paths 301 in next.config.mjs.
- [ ] Per-destination pages (`/switzerland` etc. currently redirect to `/destinations`).
- [ ] `/journal/[slug]` once a piece is written (Article JSON-LD, `type: 'article'`).

---

### Page-level SEO notes for page agents

- **Homepage OG title** reads "Luxury travel, personally curated. — Peaks2Shores"
  (tagline + brand, with a stray full stop) while the `<title>` is
  "Peaks2Shores — Luxury travel, personally curated." Override
  `openGraph.title`/`twitter.title` on `/` to match the absolute title.
- **Journey JSON-LD `availability`**: `waitlist` and `past` both map to
  `SoldOut`. Prefer `https://schema.org/Discontinued` for `past` (and keep
  `SoldOut` for sold-out/waitlist). `BreadcrumbList` could start with Home.
- **Journey OG image** is the hero (`getMedia(...).src`) — keep that when the
  page moves to the provider; it only resolves once the photo file exists.
- Keep `legalRobots` on all four legal pages and `noindex` on `/links` and
  `not-found`. `pageMetadata` now takes `noindex: true` for this.
- Any new route: `pageMetadata({ path })` with a leading slash; add it to
  `src/app/sitemap.ts` (ask Agent 6) only if it is indexable.
- Draft journal teasers must not link anywhere (no `/journal/[slug]` yet).

---

## 6. Forms API and delivery

`POST /api/enquiry` and `POST /api/subscribe` keep every guard from
`src/lib/api.ts`: same-origin (Sec-Fetch-Site, else Origin vs Host), JSON
only (415), 16KB cap (413 — now measured in bytes), field caps, allow-lists
(party, guests ≤ 18, journey title ∈ `getEnquirableJourneyTitles()`), honeypot
(`website`), 5/min/IP rate limit (429).

**The real limitation (before this change):** submissions were validated and
then only `console.info`'d without personal data — i.e. **discarded**. The
form then told the visitor "Thank you. Marc will be in touch within two days."

**Now:** both routes call `deliver()` in `src/lib/delivery.ts`:

| Situation | Response | Meaning |
| --- | --- | --- |
| Webhook env var set, provider 2xx | `200 { ok: true, delivered: true }` | Forwarded |
| Env var not set | `200 { ok: true, delivered: false }` + server `console.warn` | Received, **not kept anywhere** |
| Env var set, provider error/timeout (8s) | `502 { error }` | Form shows its "email us" fallback |
| Honeypot filled | `200 { ok: true, delivered: <configured?> }` | Indistinguishable from success |

Env vars (server only, set in Netlify UI, scope Functions):

| Var | Purpose |
| --- | --- |
| `ENQUIRY_WEBHOOK_URL` | https endpoint receiving `{ type: 'enquiry', submittedAt, data }` |
| `SUBSCRIBE_WEBHOOK_URL` | https endpoint receiving `{ type: 'subscription', submittedAt, data }` |
| `FORMS_WEBHOOK_SECRET` | optional; adds `X-Peaks2Shores-Signature: sha256=<HMAC-SHA256(body)>` |

The webhook can be Zapier/Make/n8n, a CRM's inbound endpoint, or a small
function in front of an email/mailing API. To call a provider's API directly,
add a `DeliveryProvider` in `delivery.ts` (fetch only, no SDK) and select it in
`providerFor()`.

**Launch blocker:** set `ENQUIRY_WEBHOOK_URL` (and `SUBSCRIBE_WEBHOOK_URL`)
in production. Until then every enquiry is lost.

**Client-side issues (components are not owned here):**

- `EnquiryForm.tsx` / `NewsletterForm.tsx` treat any 2xx as sent and ignore
  `delivered`. While `delivered === false` the success copy ("Marc will be in
  touch within two days") is not true. Either wire delivery before launch, or
  have the forms read `delivered` and show a neutral line plus the email
  address when it is false.
- `failureMessage()` (src/lib/forms.ts) shows the server's `error` text only
  for 422/429, so a 502 shows the form's generic "try again, or email" line —
  acceptable.
- `NewsletterForm` sends no honeypot field; the route accepts one (`website`)
  if the form adds it.
- Secrets: the only `NEXT_PUBLIC_` variable is `NEXT_PUBLIC_GTM_ID` (public by
  design). Delivery env vars are read only in route handlers; `delivery.ts`
  imports `node:crypto`, so an accidental client import fails the build loudly.

### Netlify notes

- Route handlers run as Netlify Functions. The rate limiter's `Map` is per
  warm instance (cold starts reset it; concurrent instances don't share) — a
  best-effort brake. For a hard limit add a Netlify rate-limit rule on
  `/api/*`, or back `tooManyRequests` with a shared store.
- Client IP now prefers `x-nf-client-connection-ip` (set by Netlify, not
  forgeable), then `x-forwarded-for`, then `x-real-ip`.
- `robots.ts` and the `X-Robots-Tag` header read `CONTEXT` at **build** time;
  Netlify sets it per deploy context, so previews are closed.
- ISR (`revalidate = 3600`) is supported by the Netlify Next adapter.

---

## 7. Unresolved integrations

1. Form delivery target (CRM / inbox / mailing provider with double opt-in) —
   the webhook URLs above.
2. CMS choice; adapter not written (`src/lib/content/sources/<cms>.ts`).
3. Preview/draft mode route for editors (`includeDrafts`), with secret + noindex.
4. On-demand revalidation webhook (`revalidateTag`) once a CMS exists.
5. `/journal/[slug]` and per-destination routes (then extend the sitemap and
   point the `/switzerland`, `/mexico`, `/miami` redirects at them).
6. Shared rate-limit store or Netlify rule.
7. Production origin confirmation in `site.url`.
8. Footer still hard-codes its legal links (copy in `src/lib/data/navigation.ts`);
   Header/MobileMenu/Footer should take `getNavigation()` data via props.
