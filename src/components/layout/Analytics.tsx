'use client';

import Script from 'next/script';
import { useEffect } from 'react';
import { track } from '@/lib/analytics';
import { captureFirstTouch } from '@/lib/attribution';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Measurement, all invisible.
 *
 * - Records where this visitor first came from (see lib/attribution).
 * - Counts every one-tap phone, WhatsApp and email link anywhere on the site,
 *   so no link has to remember to report itself.
 * - Loads Google Tag Manager when NEXT_PUBLIC_GTM_ID is set. The Consent Mode
 *   defaults are written by the layout before this runs.
 */
export function Analytics() {
  useEffect(() => {
    captureFirstTouch();

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') ?? '';
      if (href.startsWith('tel:')) track('phone_tap', { link_url: href });
      else if (href.startsWith('mailto:')) track('email_tap', { link_url: href });
      else if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) {
        track('whatsapp_tap', { link_url: href });
      }
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  if (!GTM_ID) return null;

  const loader = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(GTM_ID)});`;

  return (
    <Script id="gtm" strategy="afterInteractive">
      {loader}
    </Script>
  );
}
