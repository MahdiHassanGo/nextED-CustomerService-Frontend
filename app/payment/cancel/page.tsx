import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payment Cancelled", robots: { index: false, follow: false } };

export default function PaymentCancelPage() {
  return (
    <section className="section" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <div style={{ maxWidth: "520px", width: "100%", background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "40px", textAlign: "center", boxShadow: "var(--shadow-lg)" }}>
        <ShieldAlert size={52} style={{ color: "var(--amber-500)", margin: "0 auto 16px auto" }} />
        <span className="eyebrow muted-eyebrow">Checkout cancelled</span>
        <h1 style={{ fontSize: "26px", margin: "8px 0 12px 0" }}>No payment was processed</h1>
        <p style={{ color: "#64748b", fontSize: "14.5px", lineHeight: "1.6", marginBottom: "24px" }}>
          Your application has not been marked as paid. You can return to your student dashboard anytime to restart the checkout process.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/dashboard?tab=bookings" className="button button-primary">
            Return to My Applications
          </Link>
          <Link href="/services" className="button button-secondary">
            Explore Study Programs
          </Link>
        </div>
      </div>
    </section>
  );
}
