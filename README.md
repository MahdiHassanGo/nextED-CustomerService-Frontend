# nextED Frontend

> **The Future of Study Abroad. Revolutionized with AI.**

A production-ready **Next.js 16 + TypeScript** customer service management platform for **nextED** (`https://nexted.app`), the world’s first AI-powered student education consulting and study abroad platform.

---

## 🌟 Overview

**nextED** transforms international education consulting by combining an intelligent 24/7 AI Counsellor, automated course matching, real-time application milestone tracking, and licensed human education advisors into a unified student and agency workspace.

---

## 🚀 Key Platform Features

### 1. Public Student Experience
- **Hero & AI Match Engine**: Instant course exploration across 15 global destinations.
- **24/7 AI Counsellor**: Real-time answers to admission cutoffs, IELTS waivers, bank solvency, and post-study work visa policies.
- **15 Global Destinations**: Specialized admissions pathways for the **United Kingdom, USA, Canada, Australia, New Zealand, Ireland, Sweden, Denmark, Finland, Malaysia, South Korea, Cyprus, Germany, Japan, and Singapore**.
- **4-Step Autonomous Journey**:
  1. *Tell Us Who You Are* (Drop academic profile once)
  2. *AI Finds Your Matches* (Thousands of global programs scanned)
  3. *Apply Instantly* (AI-verified submissions with 100% accuracy)
  4. *Land. Live. Thrive.* (Post-arrival airport pickup, housing, and job assistance)
- **Verified Education Advisors Directory**: Search licensed counselors by destination specialization, student ratings, and consultation rates.

---

### 2. Role-Protected Workspaces

#### 🎓 Student / Applicant Workspace (`CUSTOMER`)
- **Live Application Tracking**: Multi-stage milestone tracker:
  $$\text{Application Submitted} \longrightarrow \text{Advisor Review} \longrightarrow \text{Package Paid} \longrightarrow \text{Univ. Review} \longrightarrow \text{Offer Issued} \longrightarrow \text{Visa \& Enrolled}$$
- **Consultation Scheduling**: Book 1-on-1 strategy sessions with university advisors.
- **24/7 AI Counsellor Assistant**: Embedded AI chat for visa rules, SOP refinement, and scholarship deadlines.
- **Secure Gateway Payments**: Stripe & SSLCOMMERZ checkout for university application packages.
- **Feedback & Reviews**: Rate advisors and submit verified feedback upon session completion.
- **Student Profile**: Manage contact info, target destination, and academic credentials.

#### 🧑‍🏫 Education Advisor Workspace (`TECHNICIAN`)
- **Student Inquiries Queue**: Review student academic background and accept/decline consultation requests.
- **Milestone Advancement**: Progress student applications from review to offer issuance and enrollment.
- **Consultation Packages Manager**: Create, edit, price, and publish admissions packages across disciplines.
- **Weekly Schedule Manager**: Configure day-by-day availability slots for student video consultations.
- **Advisor Profile & Credentials**: Update specializations, experience years, and advisory rates.

#### 🛡️ Platform Administrator Workspace (`ADMIN`)
- **Agency Command Center**: Real-time metrics on enrolled students, active advisors, total applications, and visa success rates (98%+).
- **User Moderation**: Filter, search, block, or reactivate Student and Advisor accounts.
- **Global Application Pipeline**: Full visibility over all university application workflows.
- **Financial Ledger**: Verified Stripe and SSLCOMMERZ transaction ledger.
- **Academic Disciplines Editor**: Add, update, and manage global study categories.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **UI & Styling**: Vanilla CSS Modern Design System (Zero runtime overhead, NextED Midnight Navy `#001738`, Electric Magenta `#ff005b`, and Cyber Cyan `#00d2ff`)
- **Icons**: Lucide React
- **Security & Proxy Gateway**: Next.js Node.js Route Handlers with HTTP-only cookie forwarding, CSRF tokens, strict CSP nonces, and input sanitization.

---

## 🔒 Security Architecture

1. **Token Isolation**: Authentication tokens are strictly stored in HTTP-only, SameSite cookies and are never exposed to client JavaScript.
2. **Double-Submit CSRF Defense**: State-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`) require both `nexted_csrf` cookie and `X-CSRF-Token` headers verified via timing-safe comparison.
3. **Backend Proxy Gateway (`/api/backend/[...path]`)**: Next.js acts as a reverse proxy gateway forwarding requests to the backend while stripping sensitive headers.
4. **Content Security Policy (CSP)**: Nonce-based script execution with zero unsafe-inline scripts in production.

---

## 💻 Getting Started

### 1. Installation
```bash
git clone <repository-url>
cd nexted-frontend
npm install
```

### 2. Environment Configuration
Create a `.env.local` file:
```env
BACKEND_URL=https://fix-it-now-6b1c.vercel.app
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 👥 Default Accounts for Testing

| Role | Email | Access Scope |
| :--- | :--- | :--- |
| **Student** | Registered via `/auth/register` | Course Search, AI Counsellor, Application Tracker, Payments |
| **Education Advisor** | Registered via `/auth/register` | Student Inquiries, Consultation Packages, Weekly Availability |
| **Platform Administrator** | Pre-configured on backend | Agency Analytics, User Moderation, Financial Ledger |

---

## 📄 License & Attribution

© 2026 **nextED**. All rights reserved. Empowering borderless education with AI precision.
