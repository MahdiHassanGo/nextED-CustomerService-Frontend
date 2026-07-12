import { LoginForm } from "@/components/LoginForm";
import { BadgeCheck, ShieldCheck, Wrench } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Sign In" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <section className="auth-page">
      <aside className="auth-side">
        <div className="auth-side-content">
          <span className="eyebrow light-eyebrow">Welcome back</span>
          <h1>Manage every service request from one secure place.</h1>
          <p>Sign in once and automatically access the correct workspace based on your backend role.</p>
          <div className="auth-benefits">
            <span>
              <ShieldCheck aria-hidden="true" />
              <span>
                <strong>Secure cookie sessions</strong>
                <small>No access tokens are stored in local storage.</small>
              </span>
            </span>
            <span>
              <BadgeCheck aria-hidden="true" />
              <span>
                <strong>Role-aware workspace</strong>
                <small>Dedicated Customer, Technician, and Admin dashboards.</small>
              </span>
            </span>
            <span>
              <Wrench aria-hidden="true" />
              <span>
                <strong>Complete booking lifecycle</strong>
                <small>Request, accept, pay, complete, and review services.</small>
              </span>
            </span>
          </div>
        </div>
      </aside>

      <div className="auth-panel">
        <div className="auth-card">
          <span className="eyebrow muted-eyebrow">Secure account access</span>
          <h2>Sign in to FixItNow</h2>
          <p>Enter the email address and password registered with your FixItNow account.</p>
          <Suspense fallback={<div className="page-loading">Loading secure sign-in…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
