"use client";

import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import type { Booking, Payment, PaymentProvider, PaymentSession, PublicUser, Review } from "@/lib/types";
import { formatDate, getErrorMessage, money } from "@/lib/utils";
import { CalendarCheck2, CalendarClock, CreditCard, MessageSquareText, ShieldCheck, Star, WalletCards, Wrench } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const cancellable = new Set(["REQUESTED", "ACCEPTED", "PAID"]);

export function CustomerDashboard({ user, activeTab }: { user: PublicUser; activeTab: string }) {
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const [bookingResult, paymentResult] = await Promise.allSettled([
      api.get<Booking[]>("/bookings"),
      api.get<Payment[]>("/payments")
    ]);
    if (bookingResult.status === "fulfilled") setBookings(bookingResult.value.data);
    if (paymentResult.status === "fulfilled") setPayments(paymentResult.value.data);
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const stats = useMemo(() => ({
    total: bookings.length,
    active: bookings.filter((booking) => ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(booking.status)).length,
    completed: bookings.filter((booking) => booking.status === "COMPLETED").length,
    paid: payments.filter((payment) => payment.status === "COMPLETED").length
  }), [bookings, payments]);

  async function cancelBooking(booking: Booking) {
    if (!window.confirm(`Cancel the booking for “${booking.service.title}”?`)) return;
    setWorkingId(booking.id);
    try {
      const response = await api.patch<Booking>(`/bookings/${booking.id}/cancel`, {});
      toast.success(response.message);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  async function createPayment(provider: PaymentProvider) {
    if (!paymentBooking) return;
    setWorkingId(paymentBooking.id);
    try {
      const response = await api.post<PaymentSession>("/payments/create", { bookingId: paymentBooking.id, provider });
      if (!response.data.checkoutUrl) throw new Error("The payment provider did not return a checkout URL.");
      window.location.assign(response.data.checkoutUrl);
    } catch (error) {
      toast.error(getErrorMessage(error));
      setWorkingId(null);
    }
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    if (!reviewBooking) return;
    setWorkingId(reviewBooking.id);
    try {
      const response = await api.post<Review>("/reviews", { bookingId: reviewBooking.id, rating: reviewForm.rating, comment: reviewForm.comment || undefined });
      toast.success(response.message);
      setReviewBooking(null);
      setReviewForm({ rating: 5, comment: "" });
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  if (loading) return <div className="dashboard-loading"><Loading label="Loading your dashboard" /></div>;

  if (activeTab === "overview") {
    const upcoming = bookings.filter((booking) => ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(booking.status)).slice(0, 4);
    return <div className="dashboard-section"><div className="dashboard-heading"><div><span className="eyebrow muted-eyebrow">Customer workspace</span><h1>Welcome back, {user.name.split(" ")[0]}</h1><p>Track every request from initial booking through secure payment and verified completion.</p></div><Link href="/services" className="button button-primary"><Wrench size={17} /> Book a service</Link></div><div className="stats-grid"><article><span className="stat-icon"><CalendarClock /></span><small>Total bookings</small><strong>{stats.total}</strong><span>All service requests</span></article><article><span className="stat-icon"><CalendarCheck2 /></span><small>Active bookings</small><strong>{stats.active}</strong><span>Awaiting or in progress</span></article><article><span className="stat-icon"><Star /></span><small>Completed</small><strong>{stats.completed}</strong><span>Eligible for reviews</span></article><article><span className="stat-icon"><WalletCards /></span><small>Verified payments</small><strong>{stats.paid}</strong><span>Completed gateway transactions</span></article></div><div className="panel-card"><div className="panel-heading"><div><h2>Upcoming and active bookings</h2><p>Your most relevant service requests.</p></div></div>{upcoming.length ? <div className="booking-list">{upcoming.map((booking) => <BookingRow booking={booking} key={booking.id} working={workingId === booking.id} onCancel={() => cancelBooking(booking)} onPay={() => setPaymentBooking(booking)} onReview={() => setReviewBooking(booking)} />)}</div> : <EmptyState title="No active bookings" description="Browse services and request a time that matches the technician’s availability." action={<Link href="/services" className="button button-primary">Browse services</Link>} />}</div><SecurityNotice />{paymentBooking && <PaymentModal booking={paymentBooking} busy={workingId === paymentBooking.id} onClose={() => setPaymentBooking(null)} onSelect={createPayment} />}{reviewBooking && <ReviewModal booking={reviewBooking} form={reviewForm} setForm={setReviewForm} busy={workingId === reviewBooking.id} onClose={() => setReviewBooking(null)} onSubmit={submitReview} />}</div>;
  }

  if (activeTab === "bookings") return <div className="dashboard-section"><div className="dashboard-heading"><div><span className="eyebrow muted-eyebrow">Service lifecycle</span><h1>My bookings</h1><p>Cancel before work begins, pay accepted bookings, and review completed jobs.</p></div><Link href="/services" className="button button-primary"><Wrench size={17} /> New booking</Link></div>{bookings.length ? <div className="booking-list panel-card">{bookings.map((booking) => <BookingRow booking={booking} key={booking.id} working={workingId === booking.id} onCancel={() => cancelBooking(booking)} onPay={() => setPaymentBooking(booking)} onReview={() => setReviewBooking(booking)} />)}</div> : <EmptyState title="No bookings yet" description="Your service requests will appear here." action={<Link href="/services" className="button button-primary">Find a service</Link>} />}{paymentBooking && <PaymentModal booking={paymentBooking} busy={workingId === paymentBooking.id} onClose={() => setPaymentBooking(null)} onSelect={createPayment} />}{reviewBooking && <ReviewModal booking={reviewBooking} form={reviewForm} setForm={setReviewForm} busy={workingId === reviewBooking.id} onClose={() => setReviewBooking(null)} onSubmit={submitReview} />}</div>;

  return <div className="dashboard-section"><div className="dashboard-heading"><div><span className="eyebrow muted-eyebrow">Transaction history</span><h1>Payments</h1><p>Payment records are created and finalized only by the backend.</p></div></div>{payments.length ? <div className="table-card"><div className="data-table payment-table"><div className="table-head"><span>Transaction</span><span>Booking</span><span>Provider</span><span>Amount</span><span>Status</span><span>Date</span></div>{payments.map((payment) => <div className="table-row" key={payment.id}><span data-label="Transaction"><strong>{payment.transactionId}</strong><small>{payment.method || "Hosted checkout"}</small></span><span data-label="Booking">{payment.booking?.service?.title || payment.bookingId.slice(0, 8)}</span><span data-label="Provider">{payment.provider}</span><span data-label="Amount">{money(payment.amount, payment.currency)}</span><span data-label="Status"><StatusBadge status={payment.status} /></span><span data-label="Date">{formatDate(payment.createdAt)}</span></div>)}</div></div> : <EmptyState title="No payment history" description="Payments become available after a technician accepts a booking." />}</div>;
}

function BookingRow({ booking, working, onCancel, onPay, onReview }: { booking: Booking; working: boolean; onCancel: () => void; onPay: () => void; onReview: () => void }) {
  return <article className="booking-row"><div className="booking-date"><strong>{new Date(booking.scheduledAt).toLocaleDateString("en-BD", { day: "2-digit", timeZone: "Asia/Dhaka" })}</strong><small>{new Date(booking.scheduledAt).toLocaleDateString("en-BD", { month: "short", timeZone: "Asia/Dhaka" })}</small></div><div className="booking-info"><span className="category-pill">{booking.service.category.name}</span><h3>{booking.service.title}</h3><p>{booking.technician.user.name} · {formatDate(booking.scheduledAt)}</p><small>{booking.address}</small></div><div className="booking-amount"><strong>{money(booking.totalAmount)}</strong><StatusBadge status={booking.status} /></div><div className="booking-actions">{booking.status === "ACCEPTED" && !booking.payment?.status?.includes("COMPLETED") && <button className="button button-primary button-small" type="button" onClick={onPay} disabled={working}><CreditCard size={15} /> Pay now</button>}{booking.status === "COMPLETED" && !booking.review && <button className="button button-secondary button-small" type="button" onClick={onReview} disabled={working}><MessageSquareText size={15} /> Review</button>}{cancellable.has(booking.status) && <button className="button button-ghost button-small danger-text" type="button" onClick={onCancel} disabled={working}>{working ? "Working…" : "Cancel"}</button>}</div></article>;
}

function PaymentModal({ booking, busy, onClose, onSelect }: { booking: Booking; busy: boolean; onClose: () => void; onSelect: (provider: PaymentProvider) => void }) {
  return <div className="modal-backdrop" role="presentation"><div className="modal compact-modal" role="dialog" aria-modal="true"><div className="modal-head"><div><span className="eyebrow muted-eyebrow">Hosted checkout</span><h2>Choose payment provider</h2></div><button className="icon-button" type="button" onClick={onClose}>×</button></div><p>You are paying <strong>{money(booking.totalAmount)}</strong> for {booking.service.title}. The backend verifies the final amount and payment status.</p><div className="payment-options"><button type="button" disabled={busy} onClick={() => onSelect("STRIPE")}><CreditCard size={23} /><span><strong>Stripe</strong><small>Secure card checkout</small></span></button><button type="button" disabled={busy} onClick={() => onSelect("SSLCOMMERZ")}><WalletCards size={23} /><span><strong>SSLCOMMERZ</strong><small>Bangladesh hosted checkout</small></span></button></div><p className="booking-note"><ShieldCheck size={15} /> You will leave FixItNow temporarily and return after checkout.</p></div></div>;
}

function ReviewModal({ booking, form, setForm, busy, onClose, onSubmit }: { booking: Booking; form: { rating: number; comment: string }; setForm: (form: { rating: number; comment: string }) => void; busy: boolean; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <div className="modal-backdrop" role="presentation"><div className="modal compact-modal" role="dialog" aria-modal="true"><div className="modal-head"><div><span className="eyebrow muted-eyebrow">Verified review</span><h2>Rate {booking.technician.user.name}</h2></div><button className="icon-button" type="button" onClick={onClose}>×</button></div><form onSubmit={onSubmit}><div className="rating-input" aria-label="Rating">{[1, 2, 3, 4, 5].map((rating) => <button type="button" key={rating} className={form.rating >= rating ? "active" : ""} onClick={() => setForm({ ...form, rating })}><Star size={25} fill="currentColor" /></button>)}</div><label className="field"><span>Comment <small>(optional)</small></span><textarea rows={5} maxLength={2000} value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} placeholder="Share what went well…" /></label><div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? "Submitting…" : "Submit review"}</button></div></form></div></div>;
}

function SecurityNotice() {
  return <div className="dashboard-security-banner"><ShieldCheck size={23} /><span><strong>Booking rules are enforced server-side</strong><small>A customer cannot book their own service, reserve an occupied slot, pay before acceptance, or review an unfinished job.</small></span></div>;
}
