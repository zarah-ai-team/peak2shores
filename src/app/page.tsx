import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { Metadata } from 'next';
import '@/components/home/home.css';
import { HomeHero } from '@/components/home/HomeHero';
import { WaysToTravel } from '@/components/home/WaysToTravel';
import { FeaturedJourneys } from '@/components/home/FeaturedJourneys';
import { WhyPeaks } from '@/components/home/WhyPeaks';
import { HowWeTravel, WhyTravel } from '@/components/home/HowWeTravel';
import { NameSlider } from '@/components/home/NameSlider';
import { HotelFlips } from '@/components/home/HotelFlips';
import { ExperienceWords } from '@/components/home/ExperienceWords';
import { ExpertButton } from '@/components/home/ExpertButton';
import { CircleBand, FounderStory, Intro, Statement } from '@/components/home/HomeSections';
import { getJourneySummaries, pageMetadata } from '@/lib/content';
import { reel, type ReelClip } from '@/lib/data/home';
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

/* A reel clip whose film or poster has not been saved yet plays its stand-in,
   so the hero never names a file that is not there. */
const inPublic = (path: string) => existsSync(join(process.cwd(), 'public', path));
const heroReel: ReelClip[] = reel.map(({ fallback, ...clip }) =>
  fallback && !(inPublic(clip.video) && inPublic(clip.img)) ? fallback : clip,
);

/* Rebuilt hourly, so a newly released journey reaches the list. */
export const revalidate = 3600;

/**
 * The homepage, after Sample C ("Marc's flow", October 2026) as revised in
 * Marc's update of 23 October 2026, with the small luxury group journeys set
 * out A&K-style (every departure as a card):
 *
 * the reel → who we are → ways to travel → the group journeys →
 * Marc's line → how we travel → why us → why travel with us → the name → the founder → where we stay → what you do
 * → the circle. "Speak to a travel designer" stays in reach throughout.
 *
 * Grounds: film → paper → paper → paper → paper (ruled) → paper (ruled) →
 * photo → paper + stone → deep lake → film → photo → footer.
 */
export default async function HomePage() {
  const journeys = await getJourneySummaries();

  return (
    <div className="hc">
      <HomeHero reel={heroReel} />
      <Intro />
      <WaysToTravel />
      <FeaturedJourneys journeys={journeys} />
      <Statement />
      <HowWeTravel />
      <WhyPeaks />
      <WhyTravel />
      <NameSlider />
      <FounderStory />
      <HotelFlips />
      <ExperienceWords />
      <CircleBand />
      <ExpertButton />
    </div>
  );
}
