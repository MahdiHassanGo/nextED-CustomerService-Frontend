import { RegisterForm } from "@/components/RegisterForm";
import { BadgeCheck, CalendarCheck2, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Create Account" };
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <section className="auth-page">
      <aside className="auth-side register-side">
        <div className="auth-side-content">
          <span className="eyebrow light-eyebrow">Join FixItNow</span>
          <h1>Build trust into every home-service experience.</h1>
          <p>Create a customer or technician account. Administrator accounts remain protected and cannot be self-registered.</p>
          <div className="auth-benefits">
            <span>
              <ShieldCheck aria-hidden="true" />
              <span>
                <strong>Validated registration</strong>
                <small>Backend rules verify every submitted field.</small>
              </span>
            </span>
            <span>
              <CalendarCheck2 aria-hidden="true" />
              <span>
                <strong>Conflict-safe booking</strong>
                <small>Availability and duplicate slots are checked.</small>
              </span>
            </span>
            <span>
              <BadgeCheck aria-hidden="true" />
              <span>
                <strong>Review integrity</strong>
                <small>Only completed customer bookings can be reviewed.</small>
              </span>
            </span>
          </div>
        </div>
      </aside>

      <div className="auth-panel">
        <div className="auth-card register-card">
          <span className="eyebrow muted-eyebrow">Create your account</span>
          <h2>Get started</h2>
          <p>Choose your role carefully; it controls the actions allowed by the API.</p>
          <RegisterForm />
        </div>
      </div>
    </section>
  );
}
