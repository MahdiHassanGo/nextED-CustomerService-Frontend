# FixItNow Frontend

A production-oriented **Next.js 16 + TypeScript** frontend for the FixItNow home-service backend.

**Live Link:** [http://fix-it-now-frontend-gamma.vercel.app/](http://fix-it-now-frontend-gamma.vercel.app/)

The frontend is already configured to use the backend URL published in the backend README:

```text
https://fix-it-now-6b1c.vercel.app
```

## Included features

### Public experience

- Professional responsive landing page
- Searchable and filterable service directory
- Searchable technician directory
- Service and technician detail pages
- Technician ratings, reviews, skills, availability, and services
- Customer and technician registration
- Secure sign-in and sign-out

### Customer workspace

- Role-specific dashboard
- Create bookings against technician availability
- View and cancel eligible bookings
- Start Stripe or SSLCOMMERZ hosted checkout
- Confirm Stripe checkout on the return page
- View payment history with original transaction currency
- Submit one review after a completed booking
- Update personal profile

### Technician workspace

- View assigned booking requests
- Accept or decline requested jobs
- Start only paid jobs
- Complete only in-progress jobs
- Create, edit, activate, and remove own services
- Maintain professional profile and skills
- Replace weekly availability slots
- Update personal profile

### Admin workspace

- Platform overview
- Search and filter users
- Block or reactivate supported accounts
- View all bookings and payments
- Create, edit, and delete unused categories
- Update personal profile

## Security architecture

This frontend intentionally does **not** store access or refresh tokens in `localStorage`, `sessionStorage`, or readable JavaScript cookies.

Browser requests go to a same-origin Next.js backend-for-frontend route:

```text
Browser -> /api/backend/* -> FixItNow Express API
```

The gateway:

- Keeps `BACKEND_URL` server-only
- Relays the backend's HTTP-only authentication cookies
- Adds double-submit CSRF validation for state-changing requests
- Validates `Origin`, `Sec-Fetch-Site`, and a custom request header
- Applies a 1 MB request limit and a backend timeout
- Does not cache API responses
- Preserves backend authorization, ownership, validation, and state-machine checks

The application also adds:

- A nonce-based Content Security Policy
- `frame-ancestors 'none'` and `object-src 'none'`
- Strict transport and browser security headers
- Same-origin API access only
- Server-side dashboard authentication guards
- Automatic cookie-based access-token refresh
- No client-exposed backend secret or payment credential

Frontend checks improve the experience, but the Express backend remains the security authority for authentication, roles, ownership, booking transitions, payment verification, and validation.

See [`SECURITY.md`](./SECURITY.md) for the threat model and production deployment checklist.

## Local setup

Requirements:

- Node.js 20.9 or newer
- npm 10 or newer
- The FixItNow backend running locally or accessible online

Install and run:

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

```text
http://localhost:3000
```

The default `.env.example` points to the deployed backend. To use a local backend, change it to:

```env
BACKEND_URL=http://localhost:5000
```

`BACKEND_URL` must remain server-only. Do not rename it to a `NEXT_PUBLIC_*` variable.

## Production build

```bash
npm run typecheck
npm run build
npm start
```

## Vercel deployment

1. Import this frontend project into Vercel.
2. Add this environment variable:

   ```env
   BACKEND_URL=https://fix-it-now-6b1c.vercel.app
   ```

3. Deploy and copy the resulting frontend origin, for example:

   ```text
   https://fixitnow-web.vercel.app
   ```

4. Update the backend environment variables:

   ```env
   FRONTEND_URL=https://fixitnow-web.vercel.app
   STRIPE_SUCCESS_URL=https://fixitnow-web.vercel.app/payment/success
   STRIPE_CANCEL_URL=https://fixitnow-web.vercel.app/payment/cancel
   ```

5. Keep SSLCOMMERZ callbacks pointed to the public backend API because the backend validates those callbacks:

   ```env
   SSLCOMMERZ_SUCCESS_URL=https://fix-it-now-6b1c.vercel.app/api/payments/sslcommerz/success
   SSLCOMMERZ_FAIL_URL=https://fix-it-now-6b1c.vercel.app/api/payments/sslcommerz/fail
   SSLCOMMERZ_CANCEL_URL=https://fix-it-now-6b1c.vercel.app/api/payments/sslcommerz/cancel
   SSLCOMMERZ_IPN_URL=https://fix-it-now-6b1c.vercel.app/api/payments/sslcommerz/ipn
   ```

6. Redeploy the backend after changing its environment variables.

The frontend origin must use HTTPS in production so the backend's `Secure` authentication cookies work correctly.

## Demo accounts

After running the backend seed:

| Role | Email | Password |
|---|---|---|
| Technician | `technician@fixitnow.local` | `Technician123!` |
| Customer | `customer@fixitnow.local` | `Customer123!` |
| Admin | `admin@fixitnow.com` | The backend `ADMIN_PASSWORD` value |

Change all demonstration credentials before a real deployment.

## Important payment behavior

- Stripe checkout returns to `/payment/success?session_id=...`; the frontend asks the backend to confirm the session.
- SSLCOMMERZ sends its verification callbacks directly to the backend endpoints configured above.
- The frontend never marks a payment or booking as paid by itself.
- Payment history displays each transaction's real currency rather than incorrectly combining USD and BDT totals.

## Project structure

```text
app/
  api/backend/[...path]/  # Secure same-origin API gateway
  api/security/csrf/      # CSRF token endpoint
  auth/                   # Login and registration
  dashboard/              # Role-aware protected dashboard
  payment/                # Checkout return screens
  services/               # Service directory and details
  technicians/            # Technician directory and profiles
components/
  dashboard/              # Customer, technician, and admin workspaces
lib/
  api-client.ts           # CSRF-aware API client and refresh handling
  server-api.ts           # Server-side authenticated reads
  types.ts                # Backend-aligned TypeScript models
proxy.ts                  # Nonce CSP and request security policy
```

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm start` | Run the production server |
| `npm run typecheck` | Generate Next.js route types and run TypeScript without emitting files |

## Notes

- Do not put JWTs, Stripe secrets, SSLCOMMERZ credentials, or database credentials in this project.
- Do not bypass the same-origin API gateway unless you redesign cookie and CSRF handling carefully.
- Keep the backend's role checks and validation enabled; frontend hiding is not authorization.
- The UI uses Bangladesh-friendly date formatting and the backend's default `Asia/Dhaka` technician timezone.
- `package.json` overrides the transitive PostCSS version to `8.5.17`; this removes the advisory present in Next.js's pinned PostCSS dependency while retaining a successful production build.
