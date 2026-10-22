import type { Metadata } from 'next';
import '@/components/home/home.css';
import { HomeHero } from '@/components/home/HomeHero';
import { WaysToTravel } from '@/components/home/WaysToTravel';
import { FeaturedJourneys } from '@/components/home/FeaturedJourneys';
import { WhyPeaks } from '@/components/home/WhyPeaks';
import { NameSlider } from '@/components/home/NameSlider';
import { HotelFlips } from '@/components/home/HotelFlips';
import { ExperienceWords } from '@/components/home/ExperienceWords';
import { ExpertButton } from '@/components/home/ExpertButton';
import { CircleBand, FounderStory, Intro, Statement } from '@/components/home/HomeSections';
import {
  getFeaturedJourneys,
  getJourneySummaries,
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
 * The homepage, after Sample C ("Marc's flow", October 2026), with the
 * editorial journeys section (one lead, two smaller, every departure) kept
 * from the earlier design:
 *
 * the reel → who we are → ways to travel → the journeys and every departure →
 * Marc's line → why us → the name → the founder → where we stay → what you do
 * → the circle. "Speak to an expert" stays in reach throughout.
 *
 * Grounds: film → paper → paper → paper → paper (ruled) → paper (ruled) →
 * photo → paper + stone → deep lake → film → photo → footer.
 */
export default async function HomePage() {
  const [featured, all, settings] = await Promise.all([
    getFeaturedJourneys(),
    getJourneySummaries(),
    getSiteSettings(),
  ]);

  return (
    <div className="hc">
      <HomeHero maxGuests={settings.maxGuests} />
      <Intro />
      <WaysToTravel />
      <FeaturedJourneys journeys={featured} all={all} />
      <Statement />
      <WhyPeaks />
      <NameSlider />
      <FounderStory />
      <HotelFlips />
      <ExperienceWords />
      <CircleBand />
      <ExpertButton />
    </div>
  );
}
