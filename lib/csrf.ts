let csrfToken: string | null = null;
let inFlight: Promise<string> | null = null;

export async function getCsrfToken(force = false): Promise<string> {
  if (force) {
    csrfToken = null;
  } else if (csrfToken) {
    return csrfToken;
  }

  if (!force && inFlight) return inFlight;

  inFlight = fetch("/api/security/csrf", {
    method: "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "X-Requested-With": "FixItNow-Web"
    }
  })
    .then(async (response) => {
      if (!response.ok) {
        csrfToken = null;
        throw new Error("Unable to initialize secure session token.");
      }
      const body = (await response.json()) as { token: string };
      csrfToken = body.token;
      return body.token;
    })
    .catch((error) => {
      csrfToken = null;
      throw error;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function clearCsrfToken(): void {
  csrfToken = null;
  inFlight = null;
}
