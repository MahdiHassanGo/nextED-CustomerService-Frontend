"use client";

import { api } from "@/lib/api-client";
import type { Payment } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";
import { CheckCircle2, LoaderCircle, ShieldCheck, XCircle } from "lucide-react";
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
    sessionId ? "Verifying your payment with Stripe…" : "The checkout session ID is missing."
  );

  useEffect(() => {
    if (!sessionId) return;
    void api.post<Payment>("/payments/confirm", { provider: "STRIPE", sessionId })
      .then((response) => {
        setState("success");
        setMessage(response.message);
      })
      .catch((error) => {
        setState("error");
        setMessage(getErrorMessage(error));
      });
  }, [sessionId]);

  return (
    <section className="result-page">
      <div className="result-card">
        {state === "loading" ? (
          <LoaderCircle className="spin-icon" size={56} />
        ) : state === "success" ? (
          <CheckCircle2 className="success-icon" size={56} />
        ) : (
          <XCircle className="error-icon" size={56} />
        )}

        <span className="eyebrow muted-eyebrow">Server verification</span>
        <h1>
          {state === "loading"
            ? "Confirming payment"
            : state === "success"
            ? "Payment confirmed"
            : "Payment needs attention"}
        </h1>
        <p>{message}</p>

        <div className="result-security">
          <ShieldCheck size={18} /> The browser redirect alone never marks a booking as paid.
        </div>

        <div className="result-actions">
          <Link href="/dashboard?tab=bookings" className="button button-primary">
            View booking
          </Link>
          <Link href="/dashboard?tab=payments" className="button button-secondary">
            Payment history
          </Link>
        </div>
      </div>
    </section>
  );
}
