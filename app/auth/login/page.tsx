import { LoginForm } from "@/components/LoginForm";
import { Bot, CheckCircle2, Globe2, GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Sign In to nextED" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="eyebrow muted-eyebrow">
            <Sparkles size={14} /> Student & Advisor Portal
          </span>
          <h1>Sign in to nextED</h1>
          <p>Access your university applications, AI counsellor, and advisor sessions.</p>
        </div>
        <Suspense fallback={<div className="page-loading">Loading secure sign-in…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
