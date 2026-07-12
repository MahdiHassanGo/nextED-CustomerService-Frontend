import { ShieldAlert } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Payment Cancelled", robots: { index: false, follow: false } };

export default function PaymentCancelPage() {
  return <section className="result-page"><div className="result-card"><ShieldAlert className="warning-icon" size={52} /><span className="eyebrow muted-eyebrow">Checkout cancelled</span><h1>No payment was confirmed</h1><p>Your booking has not been marked paid. You can return to the booking and start a new secure checkout while it remains accepted.</p><div className="result-actions"><Link href="/dashboard?tab=bookings" className="button button-primary">Return to bookings</Link><Link href="/services" className="button button-secondary">Browse services</Link></div></div></section>;
}
