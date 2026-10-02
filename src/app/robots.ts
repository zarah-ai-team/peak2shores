import type { MetadataRoute } from 'next';
import { isProduction } from '@/lib/env';
import { site } from '@/lib/site';

/**
 * AI assistants that search the web and quote the site with a link back. They
 * are how travellers asking ChatGPT, Claude, Perplexity or Gemini for trip
 * ideas hear about Peaks2Shores, so they are always allowed.
 */
const searchAgents = [
  'Googlebot',
  'Bingbot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
];

/** Crawlers that collect text to train AI models. Governed by one switch. */
const trainingAgents = ['GPTBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended', 'CCBot'];

export default function robots(): MetadataRoute.Robots {
  // Practice copies (deploy previews, staging) are closed to every crawler.
  if (!isProduction) {
    return { rules: { userAgent: '*', disallow: '/' } };
  }

  const open = { allow: '/', disallow: '/api/' };
  return {
    rules: [
      { userAgent: searchAgents, ...open },
      { userAgent: trainingAgents, ...(site.allowAiTraining ? open : { disallow: '/' }) },
      { userAgent: '*', ...open },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
