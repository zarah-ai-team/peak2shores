/**
 * The photography registry.
 *
 * No destination photography exists yet — every entry below is a drop zone,
 * exactly as it was on the design canvas. Each slot carries the art direction
 * written for the photographer plus the tonal ground the frame sits on.
 *
 * TO ADD A PHOTOGRAPH — name the file after the slot key, drop it in, sync:
 *
 *     public/images/home-hero.jpg      →  the `home-hero` slot
 *     npm run images
 *
 * That writes `media.generated.ts`, which `getMedia()` merges over this file,
 * and refreshes `PHOTOGRAPHY-BRIEF.md` with what is still outstanding. Nothing
 * here needs hand-editing, and <Frame> switches from the placeholder to
 * next/image on its own.
 */

import { discovered } from './media.generated';

export type MediaSlot = {
  /** Art direction for the photographer. Rendered on the placeholder. */
  brief: string;
  /** Short caps label shown on the placeholder. */
  label: string;
  /** The colour the frame holds before and behind the photograph. */
  tone: string;
  /** Set this once a real photograph exists. */
  src?: string;
  /** Alt text for the real photograph. Falls back to the brief. */
  alt?: string;
  /** Intrinsic size, for images that are not laid out with `fill`. */
  width?: number;
  height?: number;
};

export const media = {
  /* ---- Home ------------------------------------------------------------ */
  'home-hero': {
    label: 'Hero · coastline at first light',
    brief:
      'A boat approaching a Mediterranean coastline at first light — wide, natural light, no landmarks.',
    tone: '#2a2c2b',
  },
  // The hero rotates peaks → shores, so the name is the first thing the page says.
  'home-hero-2': {
    label: 'Hero · the peaks',
    brief: 'Alpine peaks above a lake — cool light, wide, no landmarks.',
    tone: '#31383c',
  },
  'home-hero-3': {
    label: 'Hero · the shores',
    brief: 'Open water at the end of the day — warm light, wide, no landmarks.',
    tone: '#2f3a3e',
  },
  'pillar-1': {
    label: 'Personal',
    brief: 'Marc greeting a local host — two people, natural light.',
    tone: '#c9bea9',
  },
  'pillar-2': {
    label: 'Curated',
    brief: 'A single set table on a stone terrace above the water.',
    tone: '#c9bea9',
  },
  'pillar-3': {
    label: 'Connected',
    brief: 'Hands at a market stall — produce, conversation, detail.',
    tone: '#c9bea9',
  },
  'pillar-4': {
    label: 'Thoughtfully paced',
    brief: 'An empty hotel pool at golden hour, mountains behind.',
    tone: '#c9bea9',
  },
  'feat-1': {
    label: 'Amalfi',
    brief: 'Amalfi — a fishing boat below lemon terraces.',
    tone: '#8c8f86',
  },
  'feat-2': {
    label: 'The Swiss Lakes',
    brief: 'Swiss lake — still water, larches, first snow on the peaks.',
    tone: '#4d5c5e',
  },
  'feat-3': {
    label: 'Mallorca',
    brief: 'Mallorca — a stone finca, olive trees, the Tramuntana behind.',
    tone: '#9a9587',
  },
  'tr-1': { label: 'The Alps', brief: 'Swiss peaks — cool light, snow, rock.', tone: '#3b4241' },
  'tr-2': {
    label: 'An alpine lake',
    brief: 'Alpine lake — glassy water, mountains reflected.',
    tone: '#4d5c5e',
  },
  'tr-3': {
    label: 'The Mediterranean',
    brief: 'Mediterranean coast — warm stone, blue water, late afternoon.',
    tone: '#6c7f86',
  },
  'tr-4': { label: 'Miami', brief: 'Miami — ocean light, palms, pastel sky.', tone: '#7f9aa3' },
  'ex-1': {
    label: 'Taste',
    brief: 'A long lunch table, half-eaten, sun through vines.',
    tone: '#9a9587',
  },
  'ex-2': { label: 'Meet', brief: 'An artisan at work in a small workshop.', tone: '#8a8478' },
  'ex-3': {
    label: 'Discover',
    brief: 'A quiet cloister or hillside village lane.',
    tone: '#9a9587',
  },
  'ex-4': {
    label: 'Move',
    brief: 'A ridge trail or a sailboat, two people, wide.',
    tone: '#7f8c85',
  },
  'ex-5': {
    label: 'Stay',
    brief: 'A hotel room with the doors open to a view.',
    tone: '#a09a8c',
  },
  'hotel-1': {
    label: 'Amalfi Coast',
    brief: 'Hotel terrace above the sea, umbrella pines, evening light.',
    tone: '#b9b1a0',
  },
  'hotel-2': {
    label: 'Lake Lucerne',
    brief: 'Belle-époque hotel facade on a lake, mountains behind.',
    tone: '#b9b1a0',
  },
  'hotel-3': {
    label: 'Mallorca',
    brief: 'Stone finca courtyard, olive trees, a long table.',
    tone: '#b9b1a0',
  },

  /* ---- Journeys index -------------------------------------------------- */
  'jl-1': {
    label: 'Amalfi, Slowly',
    brief: 'Amalfi — a fishing boat below lemon terraces.',
    tone: '#8c8f86',
  },
  'jl-2': {
    label: 'The Swiss Lakes',
    brief: 'Swiss lake — still water, larches, first snow on the peaks.',
    tone: '#4d5c5e',
  },
  'jl-3': {
    label: 'Mallorca',
    brief: 'Mallorca — a stone finca, olive trees, the Tramuntana behind.',
    tone: '#9a9587',
  },
  'jl-4': {
    label: 'The Cape',
    brief: 'Cape winelands — vines, mountains, a farmhouse in warm light.',
    tone: '#7a6a55',
  },
  'jl-5': {
    label: 'Como & the Engadin',
    brief: 'Lake Como — a villa garden meeting the water.',
    tone: '#5f6f6a',
  },

  /* ---- Journey: Amalfi, Slowly ----------------------------------------- */
  'am-hero': {
    label: 'Hero · Amalfi from the water',
    brief: 'Amalfi coast from the water, a single boat, early light — no crowds, no landmarks.',
    tone: '#5d6a63',
  },
  'am-why': {
    label: 'Lemon terraces',
    brief: 'Lemon terraces above the sea, a person picking, warm light.',
    tone: '#a58f6a',
  },
  'am-map': {
    label: 'Map · Sorrento peninsula',
    brief: 'Sorrento peninsula, hand-drawn or muted — Positano, Nerano, Ravello, Capri marked.',
    tone: '#dcd6c6',
  },
  'am-h1': {
    label: 'Above Positano',
    brief: 'Hotel terrace above the sea, umbrella pines, evening light.',
    tone: '#b9b1a0',
  },
  'am-h2': {
    label: 'The quiet side',
    brief: 'Cloister courtyard with citrus trees and stone arches.',
    tone: '#a9a394',
  },
  d1: {
    label: 'Day 01',
    brief: 'Hotel terrace, first evening, glasses on a table.',
    tone: '#7f8c85',
  },
  d2: {
    label: 'Day 02',
    brief: 'Steep lane in Positano, morning shade, one figure.',
    tone: '#a58f6a',
  },
  d3: {
    label: 'Day 03',
    brief: 'Wooden boat at anchor, turquoise water, people swimming.',
    tone: '#4d6f7a',
  },
  d4: {
    label: 'Day 04',
    brief: 'Lemon grove path, dappled light, a set table below.',
    tone: '#8a9a6a',
  },
  d5: { label: 'Day 05', brief: 'Empty sunbeds at a beach club, late morning.', tone: '#6c7f86' },
  d6: { label: 'Day 06', brief: 'Capri cliffs from the water, a small boat.', tone: '#5a6d78' },
  d7: {
    label: 'Day 07',
    brief: 'Hands stretching fresh mozzarella, farmhouse kitchen.',
    tone: '#9a8a6a',
  },
  d8: {
    label: 'Day 08',
    brief: 'Coastal footpath high above the sea, two walkers.',
    tone: '#7a8a7a',
  },
  d9: { label: 'Day 09', brief: 'Breakfast table on a terrace, morning light.', tone: '#b0a690' },
  g1: { label: 'Wide', brief: 'The coast from the water at dusk.', tone: '#4d6f7a' },
  g2: { label: 'Detail', brief: 'Lemons in a crate.', tone: '#a58f6a' },
  g3: { label: 'Human', brief: 'Two guests laughing at a table.', tone: '#7f8c85' },
  g4: { label: 'Architecture', brief: 'A cloister arch.', tone: '#8a9a6a' },
  g5: { label: 'Quiet', brief: 'An empty terrace at noon.', tone: '#6c7f86' },

  /* ---- Journey: The Swiss Lakes — day by day --------------------------- */
  'sl-1': {
    label: 'Day 01',
    brief: 'Lucerne’s lakefront, a steamer at the jetty.',
    tone: '#6f8088',
  },
  'sl-2': {
    label: 'Day 02',
    brief: 'A paddle steamer on Lake Lucerne, mountains behind.',
    tone: '#5f7580',
  },
  'sl-3': { label: 'Day 03', brief: 'Pilatus above the cloud, cogwheel rail.', tone: '#6b7a7c' },
  'sl-4': { label: 'Day 04', brief: 'The Albula line — a viaduct in the forest.', tone: '#5f6f63' },
  'sl-5': { label: 'Day 05', brief: 'Lake Sils, still water, larches.', tone: '#4d5c5e' },
  'sl-6': { label: 'Day 06', brief: 'An Engadin village lane, sgraffito houses.', tone: '#9a9587' },
  'sl-7': {
    label: 'Day 07',
    brief: 'A rowing boat on an Engadin lake, nobody hurrying.',
    tone: '#5d6f78',
  },
  'sl-8': { label: 'Day 08', brief: 'Zürich’s lake shore in morning light.', tone: '#8a949a' },

  /* ---- Journey: Mallorca — day by day ---------------------------------- */
  'ma-1': {
    label: 'Day 01',
    brief: 'The Tramuntana from the road, olives below.',
    tone: '#8a8a6a',
  },
  'ma-2': { label: 'Day 02', brief: 'Deià on its hill, the sea behind.', tone: '#9a9587' },
  'ma-3': { label: 'Day 03', brief: 'A cove on the west coast, clear water.', tone: '#4d6f7a' },
  'ma-4': { label: 'Day 04', brief: 'Old olive trees on a terrace.', tone: '#8a8a6a' },
  'ma-5': { label: 'Day 05', brief: 'The wooden train to Sóller, orange groves.', tone: '#a58f6a' },
  'ma-6': { label: 'Day 06', brief: 'A finca pool at noon, empty.', tone: '#9a9587' },
  'ma-7': { label: 'Day 07', brief: 'Palma’s old town, morning.', tone: '#b0a690' },

  /* ---- Journey: The Cape — day by day ---------------------------------- */
  'cp-1': { label: 'Day 01', brief: 'Table Mountain from the city, late light.', tone: '#6c7f86' },
  'cp-2': { label: 'Day 02', brief: 'The city from the mountain top.', tone: '#7f9aa3' },
  'cp-3': { label: 'Day 03', brief: 'Vineyards and a Cape Dutch farmhouse.', tone: '#7a6a55' },
  'cp-4': { label: 'Day 04', brief: 'Vines in rows under the mountains.', tone: '#7a7a55' },
  'cp-5': { label: 'Day 05', brief: 'A long table laid outdoors at dusk.', tone: '#9a8a6a' },
  'cp-6': { label: 'Day 06', brief: 'Sunset over the winelands.', tone: '#a58f6a' },
  'cp-7': {
    label: 'Day 07',
    brief: 'Chapman’s Peak, the coast road above the Atlantic.',
    tone: '#5a6d78',
  },
  'cp-8': {
    label: 'Day 08',
    brief: 'Cape Point cliffs, or the penguins at Boulders.',
    tone: '#6c7f86',
  },
  'cp-9': { label: 'Day 09', brief: 'A long empty Atlantic beach.', tone: '#8a949a' },
  'cp-10': { label: 'Day 10', brief: 'A fire on the beach, evening.', tone: '#7a6a55' },
  'cp-11': { label: 'Day 11', brief: 'Cape Town harbour, morning.', tone: '#7f9aa3' },

  /* ---- Journey: Como & the Engadin — day by day ------------------------ */
  'ce-1': { label: 'Day 01', brief: 'A villa garden meeting Lake Como.', tone: '#5f6f6a' },
  'ce-2': {
    label: 'Day 02',
    brief: 'A boat on Lake Como, villas along the shore.',
    tone: '#5a6d78',
  },
  'ce-3': { label: 'Day 03', brief: 'Bellagio’s point and its gardens.', tone: '#6f7a63' },
  'ce-4': { label: 'Day 04', brief: 'A jetty on the lake, empty chairs.', tone: '#6c7f86' },
  'ce-5': { label: 'Day 05', brief: 'The Bernina line crossing a viaduct.', tone: '#5f6f63' },
  'ce-6': { label: 'Day 06', brief: 'St. Moritz and its lake, first snow.', tone: '#8a949a' },
  'ce-7': { label: 'Day 07', brief: 'Val Roseg larches in October gold.', tone: '#a58f6a' },
  'ce-8': { label: 'Day 08', brief: 'A still Engadin lake at dawn.', tone: '#4d5c5e' },
  'ce-9': { label: 'Day 09', brief: 'Soglio on its ledge, granite behind.', tone: '#6f7a63' },
  'ce-10': { label: 'Day 10', brief: 'A train leaving the mountains.', tone: '#6b7a7c' },

  /* ---- Marc ------------------------------------------------------------ */
  'marc-portrait': {
    label: 'Marc Haeni',
    brief: 'Studio portrait of Marc Haeni.',
    tone: '#e5dfd1',
    src: '/brand/marc.webp',
    alt: 'Marc Haeni, founder of Peaks2Shores',
    width: 1150,
    height: 1400,
  },

  /* ---- Journal --------------------------------------------------------- */
  'jn-1': {
    label: 'The Engadin',
    brief: 'A high valley in larch-gold light, late autumn.',
    tone: '#6f7a63',
  },
  'jn-2': {
    label: 'September on the coast',
    brief: 'An empty Amalfi beach in soft September light.',
    tone: '#6c7f86',
  },
  'jn-3': {
    label: 'At the table',
    brief: 'A family table mid-meal, plates and hands, no faces.',
    tone: '#9a8a6a',
  },
  'jn-4': {
    label: 'A hotel worth the trip',
    brief: 'A hotel corridor or reading room, nobody in it.',
    tone: '#a9a394',
  },
} as const satisfies Record<string, MediaSlot>;

export type MediaKey = keyof typeof media;

export function getMedia(key: MediaKey): MediaSlot {
  const slot: MediaSlot = media[key];
  // A file dropped into public/images/ wins over anything declared here.
  const found = discovered[key];
  return found ? { ...slot, ...found } : slot;
}
