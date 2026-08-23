import { RegisterForm } from "@/components/RegisterForm";
import { Sparkles } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Start Your Journey | nextED" };
export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="eyebrow muted-eyebrow">
            <Sparkles size={14} /> Start in 2 Minutes
          </span>
          <h1>Join nextED</h1>
          <p>Create your student or education advisor account to get started.</p>
        </div>
        <RegisterForm />
      </div>
    </section>
  );
}
