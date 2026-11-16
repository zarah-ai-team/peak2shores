/**
 * What to tell the reader when a form endpoint says no.
 *
 * The endpoints answer a refusal with `{ error }` in plain words — a bad
 * address, too many attempts. Those are worth showing as they are: "please try
 * again" is wrong when trying again cannot work. Anything else (a 500, a body
 * that is not JSON) falls back to the form's own message.
 */
export async function failureMessage(res: Response): Promise<string> {
  if (res.status !== 422 && res.status !== 429) return '';
  try {
    const body: unknown = await res.json();
    if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
      return body.error;
    }
  } catch {
    // Not JSON. Fall through to the generic message.
  }
  return '';
}

/**
 * Send a form to its endpoint.
 *
 * The static build has no endpoints, so there it answers as the server does
 * when nothing is wired to receive the form (`delivered: false`): the form
 * then shows what was entered and offers it as a ready-written email, rather
 * than claiming something was sent.
 */
export async function postForm(path: string, body: unknown): Promise<Response> {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === '1') {
    return new Response(JSON.stringify({ ok: true, delivered: false }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
