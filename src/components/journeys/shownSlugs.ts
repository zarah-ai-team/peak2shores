'use client';

import { createContext } from 'react';

/**
 * The journeys The Collection's filters let through, by slug, so its Map view
 * (HeroCarousel) shows the same ones as the cards. `null`: nothing filters,
 * every journey shows.
 */
export const ShownSlugs = createContext<readonly string[] | null>(null);
