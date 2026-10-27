/**
 * The local content source: the TypeScript files in src/lib, lifted verbatim
 * from the approved canvas. Returns everything, unfiltered — the provider
 * applies the publishing rules.
 */
import type { ContentSource } from '../source';
import { journeyCatalog } from '../../journeys';
import {
  circle,
  experiences,
  founder,
  journal,
  journalCategories,
  peaksToShores,
  philosophy,
  pillars,
  reasons,
  services,
  signatureHotels,
  speak,
} from '../../data/copy';
import { legalNav } from '../../data/navigation';
import { ctaNav, footerNav, primaryNav, site } from '../../site';

export const localSource: ContentSource = {
  name: 'local',
  journeys: async () => journeyCatalog,
  journal: async () => journal,
  experiences: async () => experiences,
  siteSettings: async () => site,
  navigation: async () => ({
    primary: primaryNav,
    cta: ctaNav,
    footer: footerNav,
    legal: legalNav,
  }),
  pageCopy: async () => ({
    philosophy,
    pillars,
    reasons,
    peaksToShores,
    signatureHotels,
    founder,
    circle,
    services,
    speak,
    journalCategories,
  }),
};
