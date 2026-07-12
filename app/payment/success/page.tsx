import { PaymentSuccessClient } from "@/components/PaymentSuccessClient";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Payment Verification", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function PaymentSuccessPage() {
  return <Suspense fallback={<div className="page-loading">Verifying payment…</div>}><PaymentSuccessClient /></Suspense>;
}
