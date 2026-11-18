import { RATES_TBA, type Journey } from '@/lib/journeys';

/**
 * A journey's "from" price as the site shows it: "From $12,500 per person" once
 * Marc has confirmed a price (`priceFrom`), and "Rates to be announced" until
 * then. The owner chose that wording on 18 Nov 2026 in place of the "From
 * $[price] per person" placeholder of Ishika's notes of 9 Nov.
 */
export function fromPriceLabel(journey: Pick<Journey, 'priceFrom'>): string {
  return journey.priceFrom ? `From ${journey.priceFrom} per person` : RATES_TBA;
}
