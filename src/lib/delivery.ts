/**
 * Where form submissions go once they have passed the guards in ./api.ts.
 *
 * SERVER ONLY — read by the route handlers in src/app/api. The env vars here
 * have no NEXT_PUBLIC_ prefix, so Next never inlines them into a browser
 * bundle; keep it that way.
 *
 * The seam is deliberately small and needs no SDK: each form posts its
 * payload as JSON to a webhook (Zapier, Make, n8n, a CRM's inbound-webhook
 * endpoint, or a mailing provider's API behind one of those). When the env var
 * for a form is not set, nothing is sent and the result says so —
 * `delivered: false` — so the route can stay truthful about what happened.
 *
 *   ENQUIRY_WEBHOOK_URL    https endpoint that receives journey enquiries
 *   SUBSCRIBE_WEBHOOK_URL  https endpoint that receives circle sign-ups
 *   FORMS_WEBHOOK_SECRET   optional; when set, each request carries
 *                          `X-Peaks2Shores-Signature: sha256=<hex HMAC of the body>`
 *
 * To use a provider's own API instead (e.g. a transactional email service, or
 * a mailing list with double opt-in), add a `DeliveryProvider` below that calls
 * it with `fetch` and pick it in `providerFor()`. Nothing else changes.
 */
import { createHmac } from 'node:crypto';

export type EnquiryPayload = {
  name: string;
  email: string;
  phone?: string;
  party?: string;
  guests?: number;
  /** A live journey's title, or undefined for a private-journey enquiry. */
  journey?: string;
  travelWindow?: string;
  heardFrom?: string;
  notes: string;
  source: Partial<Record<string, string>>;
};

export type SubscriptionPayload = {
  email: string;
  source: Partial<Record<string, string>>;
};

export type DeliveryKind = 'enquiry' | 'subscription';

export type DeliveryResult =
  /** Handed to the provider, which accepted it. */
  | { delivered: true; provider: string }
  /** No provider configured for this form: nothing was sent anywhere. */
  | { delivered: false; reason: 'not-configured' }
  /** A provider is configured but refused or could not be reached. */
  | { delivered: false; reason: 'failed'; provider: string };

export interface DeliveryProvider {
  readonly name: string;
  send(kind: DeliveryKind, payload: EnquiryPayload | SubscriptionPayload): Promise<void>;
}

const TIMEOUT_MS = 8_000;

/** An https URL (or http on localhost, for testing), else null. */
function endpoint(value: string | undefined): URL | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    return url.protocol === 'https:' || (local && url.protocol === 'http:') ? url : null;
  } catch {
    return null;
  }
}

function webhookProvider(url: URL): DeliveryProvider {
  return {
    name: 'webhook',
    async send(kind, payload) {
      const body = JSON.stringify({
        type: kind,
        submittedAt: new Date().toISOString(),
        data: payload,
      });
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const secret = process.env.FORMS_WEBHOOK_SECRET;
      if (secret) {
        headers['X-Peaks2Shores-Signature'] =
          `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
      }
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body,
        cache: 'no-store',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
    },
  };
}

function providerFor(kind: DeliveryKind): DeliveryProvider | null {
  const url = endpoint(
    kind === 'enquiry' ? process.env.ENQUIRY_WEBHOOK_URL : process.env.SUBSCRIBE_WEBHOOK_URL,
  );
  return url ? webhookProvider(url) : null;
}

/** Whether submissions of this kind currently go anywhere. */
export function isDeliveryConfigured(kind: DeliveryKind) {
  return providerFor(kind) !== null;
}

/**
 * Send a submission on. Never throws; never logs personal data — only the
 * kind, the provider and the outcome.
 */
export async function deliver(kind: 'enquiry', payload: EnquiryPayload): Promise<DeliveryResult>;
export async function deliver(
  kind: 'subscription',
  payload: SubscriptionPayload,
): Promise<DeliveryResult>;
export async function deliver(
  kind: DeliveryKind,
  payload: EnquiryPayload | SubscriptionPayload,
): Promise<DeliveryResult> {
  const provider = providerFor(kind);
  if (!provider) {
    console.warn(
      `[peaks2shores] ${kind} NOT delivered: no provider configured ` +
        `(set ${kind === 'enquiry' ? 'ENQUIRY_WEBHOOK_URL' : 'SUBSCRIBE_WEBHOOK_URL'})`,
    );
    return { delivered: false, reason: 'not-configured' };
  }
  try {
    await provider.send(kind, payload);
    return { delivered: true, provider: provider.name };
  } catch (error) {
    console.error(`[peaks2shores] ${kind} delivery failed`, {
      provider: provider.name,
      error: error instanceof Error ? error.message : 'unknown',
    });
    return { delivered: false, reason: 'failed', provider: provider.name };
  }
}
