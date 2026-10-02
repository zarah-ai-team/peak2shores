/**
 * The moments that matter, as named events on the Google Tag Manager data
 * layer. GA4, the Meta Pixel and Google Ads conversions are all configured
 * inside the GTM container against these names — none of them needs code here.
 *
 * Safe to call with no container installed: events simply wait in the array.
 */
export type TrackedEvent =
  | 'enquiry_sent'
  | 'newsletter_signup'
  | 'interest_registered'
  | 'question_submitted'
  | 'call_booked'
  | 'phone_tap'
  | 'whatsapp_tap'
  | 'email_tap';

type DataLayerWindow = Window & { dataLayer?: Record<string, unknown>[] };

export function track(event: TrackedEvent, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const w = window as DataLayerWindow;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({ event, ...params });
}

/**
 * Consent Mode v2 defaults, set before the container loads.
 *
 * Visitors in the EEA, UK and Switzerland start with every category denied
 * until they choose — the law there requires it, and a consent banner will
 * update these. Everyone else (the US audience) starts granted, which US law
 * permits; the privacy policy explains how to opt out.
 */
const CONSENT_REGIONS = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IS',
  'IE',
  'IT',
  'LV',
  'LI',
  'LT',
  'LU',
  'MT',
  'NL',
  'NO',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
  'GB',
  'CH',
];

const denied = {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
};
const granted = {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted',
};

export const consentDefaults = [
  'window.dataLayer=window.dataLayer||[];',
  'function gtag(){dataLayer.push(arguments);}',
  `gtag('consent','default',${JSON.stringify({ ...denied, region: CONSENT_REGIONS, wait_for_update: 500 })});`,
  `gtag('consent','default',${JSON.stringify(granted)});`,
  "gtag('set','ads_data_redaction',true);",
].join('');
