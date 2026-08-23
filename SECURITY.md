# Security Guide

## Security Model

FixItNow uses defense-in-depth across the full application stack:

1. **Express API**: Authenticates users, enforces roles and resource ownership, validates payload structure, verifies payment callbacks, and controls booking lifecycle transitions.
2. **Next.js Backend-for-Frontend (BFF) Gateway**: Proxies API requests while isolating authentication cookies from browser JavaScript.
3. **Active Next.js Security Middleware**: Enforces cryptographic per-request nonces, Content Security Policy (CSP), and modern browser security headers across all page routes.
4. **Hardened CSRF Protection**: Validates same-origin headers, custom request tokens, and cryptographic double-submit cookies with automatic client token healing.
5. **Open Redirect & URL Validation**: Validates all internal navigation and external hosted checkout redirects against allowlists and protocols.
6. **Input Sanitization**: Normalizes inputs to strip control characters and null bytes before submission.

The frontend is not a replacement for backend authorization. Every protected operation continues to be rejected by the backend when the role, owner, resource state, or payload is invalid.

## Authentication & Session Security

- **Cookie Storage**: Access and refresh JWTs remain exclusively in backend-issued `HTTP-only`, `SameSite=Lax`/`SameSite=Strict`, `Secure` cookies.
- **No Token Leaks**: Tokens are never stored in `localStorage`, `sessionStorage`, or JavaScript memory variables.
- **Silent JWT Refresh**: The API client automatically handles 401 Unauthorized responses by attempting a single refresh via `/auth/refresh`.
- **Session Termination**: Logout requests trigger backend cookie clearance and immediately purge frontend CSRF caches and user state.

## CSRF Protection & Auto-Healing

State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) require all of the following validations:

- Exact match between `Origin` and expected application host.
- `Sec-Fetch-Site` header restricted to `same-origin` or `same-site`.
- `X-Requested-With: FixItNow-Web` custom header.
- A cryptographic random token present in both an HTTP-only cookie (`__Host-fixit_csrf` in production) and the `X-CSRF-Token` header.
- Constant-time string comparison (`timingSafeEqual`) in the gateway.
- **Auto-Healing**: If a 403 Forbidden CSRF error is encountered by client-side JavaScript, the API client automatically fetches a new CSRF token and retries the operation once seamlessly.

The CSRF endpoint and gateway responses are strictly configured with `Cache-Control: no-store, no-cache, must-revalidate, max-age=0`.

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

## API Gateway & Path Traversal Protections

The BFF gateway (`/api/backend/[...path]`):
- Validates path segments against directory traversal (`..`, `.`, `%2e`, null bytes, control characters).
- Restricts payload sizes to a maximum of 1 MB (`MAX_BODY_BYTES`).
- Filters incoming headers and strips sensitive upstream headers (`server`, `x-powered-by`).
- Injects `x-forwarded-for`, `x-forwarded-host`, and `x-forwarded-proto`.

## Payment & Redirect Security

- **Validation**: Checkout URLs returned from payment endpoints are verified with `getSafeExternalUrl` to strictly enforce `https:` schemes before triggering browser navigation.
- **Internal Redirection**: Login and next-page redirections are validated with `getSafeRedirect` to prevent open-redirect exploits.
- **State Enforcement**: Checkout sessions and final payment statuses are verified exclusively by the backend via webhook and callback signatures.

## Deployment Checklist

- [ ] Ensure HTTPS is enabled for both frontend and backend domains.
- [ ] Configure `BACKEND_URL` securely on the server.
- [ ] Ensure backend `FRONTEND_URL` matches the deployed frontend origin.
- [ ] Configure Stripe webhook secret and SSLCOMMERZ merchant validation.
- [ ] Review environment variables to prevent secret leakage in client builds.
- [ ] Run `npm audit` and verify dependency health before each release.
