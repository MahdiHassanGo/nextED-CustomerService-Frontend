# Security Guide: nextED Platform

## Security Model

**nextED** uses defense-in-depth across the entire application stack:

1. **Express & Nest/Node API**: Authenticates users, enforces role permissions (`CUSTOMER` / Student, `TECHNICIAN` / Education Advisor, `ADMIN` / Platform Admin), validates payload structure, verifies payment callbacks, and controls multi-stage application lifecycle transitions.
2. **Next.js Backend-for-Frontend (BFF) Gateway**: Proxies API requests while isolating authentication cookies from browser JavaScript.
3. **Active Next.js Security Middleware**: Enforces cryptographic per-request nonces, Content Security Policy (CSP), and modern browser security headers across all page routes.
4. **Hardened CSRF Protection**: Validates same-origin headers, custom request tokens (`X-Requested-With: NextED-Web`), and cryptographic double-submit cookies with automatic client token healing.
5. **Open Redirect & URL Validation**: Validates all internal navigation and external hosted checkout redirects against allowlists and protocols.
6. **Input Sanitization**: Normalizes inputs to strip control characters and null bytes before submission.

---

## Authentication & Session Security

- **Cookie Storage**: Access and refresh JWTs remain exclusively in backend-issued `HTTP-only`, `SameSite=Lax`/`SameSite=Strict`, `Secure` cookies.
- **No Token Leaks**: Tokens are never stored in `localStorage`, `sessionStorage`, or client-side JavaScript memory variables.
- **Silent JWT Refresh**: The API client automatically handles 401 Unauthorized responses by attempting a single refresh via `/auth/refresh`.
- **Session Termination**: Logout requests trigger backend cookie clearance and immediately purge frontend CSRF caches and user state.

---

## CSRF Protection & Auto-Healing

State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) require all of the following validations:

- Exact match between `Origin` and expected application host.
- `Sec-Fetch-Site` header restricted to `same-origin` or `same-site`.
- `X-Requested-With: NextED-Web` custom header.
- A cryptographic random token present in both an HTTP-only cookie (`__Host-nexted_csrf` in production, `nexted_csrf` in dev) and the `X-CSRF-Token` header.
- Constant-time string comparison (`timingSafeEqual`) in the gateway.
- **Auto-Healing**: If a 403 Forbidden CSRF error is encountered by client-side JavaScript, the API client automatically fetches a new CSRF token and retries the operation once seamlessly.

---

## Browser Security Headers & Middleware

The Next.js security middleware (`middleware.ts`) and `next.config.ts` configure:

- **Content Security Policy (CSP)**: Nonce-based script and style policy, `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and production `upgrade-insecure-requests`.
- **Strict-Transport-Security (HSTS)**: `max-age=63072000; includeSubDomains; preload`.
- **X-Frame-Options**: `DENY` (Clickjacking prevention).
- **X-Content-Type-Options**: `nosniff` (MIME sniffing prevention).
- **Referrer-Policy**: `strict-origin-when-cross-origin`.
- **Permissions-Policy**: Restricted access for camera, microphone, geolocation, usb, accelerometer, etc.
- **Cross-Origin Policies**: `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Resource-Policy: same-origin`.
- **X-Permitted-Cross-Domain-Policies**: `none` (prevents cross-domain policy files).
- **X-XSS-Protection**: `0` (disables legacy buggy browser auditors in favor of CSP).
- **X-DNS-Prefetch-Control**: `off`.

---

## Payment & Redirect Security

- **Hosted Checkout Sessions**: Payments are initiated via backend session endpoints returning validated gateway checkout URLs.
- **Strict URL Validation**: Redirect targets are validated using `getSafeExternalUrl` to ensure standard HTTPS protocol.
- **Server Confirmation**: Redirect return pages verify checkout session IDs directly with backend gateway callbacks before advancing application status.
