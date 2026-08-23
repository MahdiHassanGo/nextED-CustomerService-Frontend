"use client";

import { api } from "@/lib/api-client";
import type { Payment } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";
import { CheckCircle2, LoaderCircle, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function PaymentSuccessClient() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<"loading" | "success" | "error">(
    sessionId ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    sessionId ? "Verifying your consultation package payment with Stripe…" : "The checkout session ID is missing."
  );

  useEffect(() => {
    if (!sessionId) return;
    void api.post<Payment>("/payments/confirm", { provider: "STRIPE", sessionId })
      .then((response) => {
        setState("success");
        setMessage(response.message || "Your application package payment has been confirmed by the server.");
      })
      .catch((error) => {
        setState("error");
        setMessage(getErrorMessage(error));
      });
  }, [sessionId]);

  return (
    <section className="section" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <div style={{ maxWidth: "520px", width: "100%", background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "40px", textAlign: "center", boxShadow: "var(--shadow-lg)" }}>
        {state === "loading" ? (
          <LoaderCircle size={56} style={{ color: "var(--cyan-600)", margin: "0 auto 16px auto", animation: "spin 1s linear infinite" }} />
        ) : state === "success" ? (
          <CheckCircle2 size={56} style={{ color: "var(--emerald-600)", margin: "0 auto 16px auto" }} />
        ) : (
          <XCircle size={56} style={{ color: "var(--red-600)", margin: "0 auto 16px auto" }} />
        )}

        <span className="eyebrow muted-eyebrow">
          <Sparkles size={14} /> nextED Server Confirmation
        </span>
        <h1 style={{ fontSize: "26px", margin: "8px 0 12px 0" }}>
          {state === "loading"
            ? "Confirming Package Payment"
            : state === "success"
            ? "Payment Confirmed Successfully"
            : "Payment Needs Attention"}
        </h1>
        <p style={{ color: "#64748b", fontSize: "14.5px", lineHeight: "1.6", marginBottom: "24px" }}>
          {message}
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12.5px", color: "var(--muted)", background: "var(--surface-alt)", padding: "10px", borderRadius: "var(--radius-md)", marginBottom: "24px" }}>
          <ShieldCheck size={16} /> Verified directly with backend gateway before milestone update.
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <Link href="/dashboard?tab=bookings" className="button button-primary">
            View My Application
          </Link>
          <Link href="/dashboard?tab=payments" className="button button-secondary">
            Payment Receipts
          </Link>
        </div>
      </div>
    </section>
  );
}
