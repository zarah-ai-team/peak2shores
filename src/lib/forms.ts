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
