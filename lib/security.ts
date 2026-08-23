/**
 * Security validation and sanitization utilities.
 */

/**
 * Validates and normalizes internal redirect paths to protect against Open Redirect vulnerabilities.
 * Prevents protocol-relative URLs (`//evil.com`), backslash escapes (`/\\evil.com`), and control characters.
 */
export function getSafeRedirect(target: string | null | undefined, fallback = "/dashboard"): string {
  if (!target || typeof target !== "string") return fallback;

  const trimmed = target.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\") || trimmed.includes("\\")) {
    return fallback;
  }

  try {
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return fallback;
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

/**
 * Validates external redirect URLs (e.g. Stripe / SSLCOMMERZ checkout sessions).
 * Strictly ensures standard HTTP/HTTPS protocols and rejects dangerous schemes (javascript:, data:, vbscript:).
 */
export function getSafeExternalUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;

  try {
    const parsed = new URL(url.trim());
    const isAllowedProtocol =
      parsed.protocol === "https:" ||
      (process.env.NODE_ENV === "development" && parsed.protocol === "http:");

    if (!isAllowedProtocol) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Strips dangerous control characters and null bytes from user text inputs.
 */
export function sanitizeInput(value: string | null | undefined): string {
  if (!value || typeof value !== "string") return "";
  // Strip null bytes, unprintable control characters (except standard newlines/tabs), and bidi override characters
  return value
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g, "")
    .trim();
}
