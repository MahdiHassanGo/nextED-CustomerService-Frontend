# Security Guide

## Security model

FixItNow uses defense in depth:

1. The Express API authenticates users, enforces roles and ownership, validates input, verifies payments, and controls booking-state transitions.
2. The Next.js application exposes a same-origin backend-for-frontend gateway instead of exposing authentication tokens to browser JavaScript.
3. The browser sends state-changing requests only with same-origin, CSRF, and custom-header proof.
4. Security headers reduce script injection, framing, MIME sniffing, and unnecessary browser permissions.

The frontend is not a replacement for backend authorization. Every protected operation must continue to be rejected by the backend when the role, owner, resource state, or payload is invalid.

## Authentication

- Access and refresh JWTs remain in backend-issued HTTP-only cookies.
- Tokens are never written to `localStorage` or `sessionStorage`.
- The API client retries an expired authenticated request once through `/auth/refresh`.
- Logout is performed by the backend and clears both authentication cookies.
- Production must use HTTPS because the backend uses `Secure` cookies.

## CSRF protection

Unsafe requests require all of the following:

- Exact same-origin `Origin`
- `Sec-Fetch-Site` of `same-origin` when the browser supplies it
- `X-Requested-With: FixItNow-Web`
- A random CSRF value in both an HTTP-only cookie and `X-CSRF-Token`
- Constant-time comparison in the gateway

The CSRF endpoint and gateway responses are never cached.

## Browser security headers

The application configures:

- Nonce-based Content Security Policy
- Strict Transport Security
- `X-Frame-Options: DENY`
- `frame-ancestors 'none'`
- `X-Content-Type-Options: nosniff`
- Strict referrer policy
- Cross-origin opener/resource policies
- Restricted browser permissions

## Payment rules

- Checkout sessions are created only by the backend.
- Amounts are derived and checked by the backend.
- Stripe return data is confirmed with the backend.
- SSLCOMMERZ verification callbacks go directly to the backend.
- The frontend never changes a booking to `PAID` by itself.
- Payment records retain their original currencies.

## Deployment checklist

- [ ] Use HTTPS for both frontend and backend.
- [ ] Keep `BACKEND_URL` server-only.
- [ ] Configure the backend `FRONTEND_URL` with the exact deployed frontend origin.
- [ ] Configure Stripe success and cancellation URLs for the deployed frontend.
- [ ] Keep SSLCOMMERZ callback URLs on the deployed backend.
- [ ] Store JWT and payment secrets only in the backend host's secret manager.
- [ ] Replace all seeded passwords.
- [ ] Use strong, independent JWT secrets.
- [ ] Verify Stripe webhook signatures and SSLCOMMERZ validation in production.
- [ ] Run `npm audit` and `npm run build` before deployment.
- [ ] Review backend and frontend logs without recording tokens, passwords, or payment secrets.
- [ ] Apply database backups, monitoring, rate limiting, and alerting at the production infrastructure layer.

## Dependency status at delivery

The delivered dependency tree was checked with:

```bash
npm audit --omit=dev --audit-level=high
```

It reported zero known vulnerabilities after applying the documented PostCSS override. Re-run the audit whenever dependencies or the lockfile change.
