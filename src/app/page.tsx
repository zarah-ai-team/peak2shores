import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { Philosophy } from '@/components/home/Philosophy';
import { PeaksToShores } from '@/components/home/PeaksToShores';
import { FeaturedJourneys } from '@/components/home/FeaturedJourneys';
import { Pillars } from '@/components/home/Pillars';
import { FounderStrip } from '@/components/home/FounderStrip';
import { HotelsStrip } from '@/components/home/HotelsStrip';
import { ExperiencesStrip } from '@/components/home/ExperiencesStrip';
import { Circle } from '@/components/home/Circle';
import { ServicesStrip } from '@/components/home/ServicesStrip';
import { SpeakToUs } from '@/components/home/SpeakToUs';
import {
  getExperiences,
  getFeaturedJourneys,
  getJourneySummaries,
  getPageContent,
  getSiteSettings,
  pageMetadata,
} from '@/lib/content';
import { site } from '@/lib/site';

/* The homepage title is the layout's default, set as absolute so the
   "%s — Peaks2Shores" template does not append the brand a second time. The
   share titles follow the same order — brand first — rather than
   pageMetadata's "page — brand" pattern, which would read
   "Luxury travel, personally curated. — Peaks2Shores". */
const homeTitle = `${site.name} — ${site.tagline}`;
const base = pageMetadata({ title: site.tagline, description: site.description, path: '/' });

export const metadata: Metadata = {
  ...base,
  title: { absolute: homeTitle },
  openGraph: { ...base.openGraph, title: homeTitle },
  twitter: { ...base.twitter, title: homeTitle },
};

/* Rebuilt hourly, so a newly released journey reaches the featured list. */
export const revalidate = 3600;

/**
 * The homepage, as one sequence (DESIGN-SPEC §4, revised in the October 2026
 * client review — more full-screen photography and film, less text):
 * arrive → the belief → what every journey is held to → the journeys and
 * every departure → the other ways to travel → the name → the man → what you
 * do → where you sleep → speak to us → stay in touch.
 *
 * Grounds: film → ivory → panel → ivory → ivory (ruled) → forest + photo →
 * stone → photo → ivory → photo → ivory → footer (forest-deep). The ivory
 * Circle sits between the last dark and the footer (DESIGN-REVIEW P1.5); the
 * footer hides its own sign-up on /.
 */
export default async function HomePage() {
  const [home, featured, all, experiences, settings] = await Promise.all([
    getPageContent('home'),
    getFeaturedJourneys(),
    getJourneySummaries(),
    getExperiences(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Hero maxGuests={settings.maxGuests} />
      <Philosophy philosophy={home.philosophy} />
      <Pillars pillars={home.pillars} />
      <FeaturedJourneys journeys={featured} all={all} />
      <ServicesStrip services={home.services} />
      <PeaksToShores variant="signature" content={home.peaksToShores} label="05 — The name" />
      <FounderStrip founder={home.founder} />
      <ExperiencesStrip experiences={experiences} />
      <HotelsStrip hotels={home.signatureHotels} />
      <SpeakToUs speak={home.speak} />
      <Circle circle={home.circle} />
    </>
  );
}
