import type { Metadata } from 'next';
import { Hero } from '@/components/home/Hero';
import { Philosophy } from '@/components/home/Philosophy';
import { Pillars } from '@/components/home/Pillars';
import { FeaturedJourneys } from '@/components/home/FeaturedJourneys';
import { WhyUs } from '@/components/home/WhyUs';
import { FounderStrip } from '@/components/home/FounderStrip';
import { PeaksToShores } from '@/components/home/PeaksToShores';
import { ExperiencesStrip } from '@/components/home/ExperiencesStrip';
import { HotelsStrip } from '@/components/home/HotelsStrip';
import { Circle } from '@/components/home/Circle';
import { pageMetadata } from '@/lib/seo';
import { site } from '@/lib/site';

/* The homepage title is the layout's default, set as absolute so the
   "%s — Peaks2Shores" template does not append the brand a second time. */
export const metadata: Metadata = {
  ...pageMetadata({ title: site.tagline, description: site.description, path: '/' }),
  title: { absolute: `${site.name} — ${site.tagline}` },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <Philosophy />
      <Pillars />
      <FeaturedJourneys />
      <WhyUs />
      <FounderStrip />
      <PeaksToShores />
      <ExperiencesStrip />
      <HotelsStrip />
      <Circle />
    </>
  );
}
