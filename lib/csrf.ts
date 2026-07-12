let csrfToken: string | null = null;
let inFlight: Promise<string> | null = null;

export async function getCsrfToken(force = false): Promise<string> {
  if (!force && csrfToken) return csrfToken;
  if (!force && inFlight) return inFlight;

  inFlight = fetch("/api/security/csrf", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: { Accept: "application/json" }
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Unable to initialize the secure session.");
      const body = (await response.json()) as { token: string };
      csrfToken = body.token;
      return body.token;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function clearCsrfToken() {
  csrfToken = null;
}
