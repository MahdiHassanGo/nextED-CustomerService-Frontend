"use client";

import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import { getSafeExternalUrl, sanitizeInput } from "@/lib/security";
import type { Booking, Payment, PaymentProvider, PaymentSession, PublicUser, Review } from "@/lib/types";
import { applicationStatusLabel, formatDate, getErrorMessage, money } from "@/lib/utils";
import {
  BadgeCheck,
  Bot,
  CalendarCheck2,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileCheck2,
  Globe2,
  GraduationCap,
  Layers,
  MessageSquareText,
  Plane,
  ShieldCheck,
  Sparkles,
  Star,
  WalletCards,
  Zap
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const cancellableStatuses = new Set(["REQUESTED", "ACCEPTED", "PAID"]);

interface CustomerDashboardProps {
  user: PublicUser;
  activeTab: string;
}

export function CustomerDashboard({ user, activeTab }: CustomerDashboardProps) {
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<Booking | null>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });

  // AI Counsellor state
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: `Hello ${user.name.split(" ")[0]}! I'm your 24/7 NextED AI Counsellor. I have access to admission guidelines across 15 global destinations. What country or university would you like to explore today?`
    }
  ]);

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

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => ({
    total: bookings.length,
    active: bookings.filter((b) => ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(b.status)).length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    paid: payments.filter((p) => p.status === "COMPLETED").length
  }), [bookings, payments]);

  async function cancelBooking(booking: Booking) {
    if (!window.confirm(`Withdraw the application/consultation for “${booking.service.title}”?`)) return;
    setWorkingId(booking.id);
    try {
      const response = await api.patch<Booking>(`/bookings/${booking.id}/cancel`, {});
      toast.success(response.message || "Application withdrawn.");
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
      const response = await api.post<PaymentSession>("/payments/session", {
        bookingId: paymentBooking.id,
        provider
      });
      const url = getSafeExternalUrl(response.data.checkoutUrl);
      if (url) {
        toast.success("Redirecting to secure gateway checkout...");
        window.location.assign(url);
      } else {
        toast.success("Payment recorded.");
        setPaymentBooking(null);
        await load();
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  async function submitReview(event: FormEvent) {
    event.preventDefault();
    if (!reviewBooking) return;
    setWorkingId(reviewBooking.id);
    try {
      const sanitizedComment = sanitizeInput(reviewForm.comment);
      const response = await api.post<Review>("/reviews", {
        bookingId: reviewBooking.id,
        rating: Number(reviewForm.rating),
        comment: sanitizedComment || undefined
      });
      toast.success(response.message || "Thank you for your feedback!");
      setReviewBooking(null);
      setReviewForm({ rating: 5, comment: "" });
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  function handleAiQuestionSubmit(event: FormEvent) {
    event.preventDefault();
    if (!aiChatInput.trim()) return;
    const query = aiChatInput.trim();
    const newHistory = [...aiChatHistory, { sender: "user" as const, text: query }];
    setAiChatHistory(newHistory);
    setAiChatInput("");

    setTimeout(() => {
      let botResponse = `✨ Based on NextED's real-time university database: For ${query.toLowerCase().includes("scholarship") ? "scholarships" : "your query"}, top partner universities in the UK, USA, Australia, and Canada provide dedicated fast-track review. Would you like to schedule a 1-on-1 advisor session or upload your transcripts for automated GPA conversion?`;
      if (query.toLowerCase().includes("ielts") || query.toLowerCase().includes("english")) {
        botResponse = `✨ Most UK & Australian universities require IELTS 6.5 (min 6.0 in each band) for Postgraduates, or equivalent PTE / TOEFL. Medium of Instruction (MOI) waivers are also accepted by over 18 partner universities in the UK.`;
      } else if (query.toLowerCase().includes("visa") || query.toLowerCase().includes("funds")) {
        botResponse = `✨ NextED's visa accuracy rate is 98%. For student visa filing, you'll need your CAS/COE/I-20, proof of financial solvency for 28 consecutive days, and a valid biometric passport. Our licensed advisors will audit your file prior to embassy submission.`;
      } else if (query.toLowerCase().includes("job") || query.toLowerCase().includes("work") || query.toLowerCase().includes("housing")) {
        botResponse = `✨ Under NextED's "You Land. We Handle." program: International students in Australia and the UK can work up to 20–24 hours/week during term time and full-time on breaks. We coordinate airport pickup and student accommodation before your flight departs.`;
      }
      setAiChatHistory([...newHistory, { sender: "bot" as const, text: botResponse }]);
    }, 600);
  }

  if (loading) {
    return <Loading label="Loading your student workspace..." />;
  }

  return (
    <div>
      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <span className="eyebrow muted-eyebrow">
                <Sparkles size={16} /> Student Dashboard
              </span>
              <h2>Welcome back, {user.name.split(" ")[0]}!</h2>
              <p>Track your university admissions, AI course recommendations, and upcoming advisor sessions.</p>
            </div>
            <Link href="/services" className="button button-primary">
              <GraduationCap size={18} /> Explore Programs
            </Link>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <Layers size={24} />
              </div>
              <div className="stat-info">
                <small>Total Applications</small>
                <strong>{stats.total}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon cyan">
                <Clock3 size={24} />
              </div>
              <div className="stat-info">
                <small>Active & In Review</small>
                <strong>{stats.active}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-info">
                <small>Offers & Admitted</small>
                <strong>{stats.completed}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon cyan">
                <CreditCard size={24} />
              </div>
              <div className="stat-info">
                <small>Verified Payments</small>
                <strong>{stats.paid}</strong>
              </div>
            </div>
          </div>

          {/* Multi-Stage Live Application Progress */}
          {bookings.length > 0 && (
            <div className="timeline-card">
              <div className="timeline-header">
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "17px" }}>Latest Application: {bookings[0].service.title}</h3>
                  <small style={{ color: "var(--muted)" }}>Assigned Advisor: {bookings[0].technician.user?.name || "Education Specialist"}</small>
                </div>
                <StatusBadge status={bookings[0].status} />
              </div>

              <div className="timeline-steps">
                <div className={`timeline-step ${["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS", "COMPLETED"].includes(bookings[0].status) ? "completed" : ""}`}>
                  <div className="timeline-dot" />
                  <span>1. Submitted</span>
                </div>
                <div className={`timeline-step ${["ACCEPTED", "PAID", "IN_PROGRESS", "COMPLETED"].includes(bookings[0].status) ? "completed" : bookings[0].status === "REQUESTED" ? "active" : ""}`}>
                  <div className="timeline-dot" />
                  <span>2. Advisor Review</span>
                </div>
                <div className={`timeline-step ${["PAID", "IN_PROGRESS", "COMPLETED"].includes(bookings[0].status) ? "completed" : bookings[0].status === "ACCEPTED" ? "active" : ""}`}>
                  <div className="timeline-dot" />
                  <span>3. Package Paid</span>
                </div>
                <div className={`timeline-step ${["IN_PROGRESS", "COMPLETED"].includes(bookings[0].status) ? "completed" : bookings[0].status === "PAID" ? "active" : ""}`}>
                  <div className="timeline-dot" />
                  <span>4. Univ. Review</span>
                </div>
                <div className={`timeline-step ${bookings[0].status === "COMPLETED" ? "completed" : bookings[0].status === "IN_PROGRESS" ? "active" : ""}`}>
                  <div className="timeline-dot" />
                  <span>5. Offer Issued</span>
                </div>
                <div className={`timeline-step ${bookings[0].status === "COMPLETED" ? "completed" : ""}`}>
                  <div className="timeline-dot" />
                  <span>6. Visa & Enrolled</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick AI Assistance Banner */}
          <div style={{ background: "linear-gradient(135deg, var(--navy-950) 0%, #03214a 100%)", borderRadius: "var(--radius-xl)", padding: "28px", color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            <div>
              <span className="status-badge success" style={{ marginBottom: "10px" }}>
                <Zap size={12} /> 24/7 AI Engine Online
              </span>
              <h3 style={{ color: "#fff", fontSize: "19px", margin: "4px 0" }}>Need instant help with university selection or visa requirements?</h3>
              <p style={{ color: "#cbd5e1", fontSize: "14px", margin: 0 }}>Ask our intelligent counsellor about minimum IELTS scores, scholarships, and post-arrival housing.</p>
            </div>
            <button type="button" className="button button-cyan" onClick={() => {
              const tabBtn = document.querySelector('button:has(svg.lucide-bot)') as HTMLButtonElement | null;
              tabBtn?.click();
            }}>
              <Bot size={18} /> Open 24/7 AI Counsellor
            </button>
          </div>
        </>
      )}

      {/* 2. APPLICATIONS & CONSULTATIONS TAB */}
      {activeTab === "bookings" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <h2>My Study Abroad Applications & Consultations</h2>
              <p>Review scheduled sessions, track admission progress, and download official package invoices.</p>
            </div>
            <Link href="/services" className="button button-primary button-small">
              + Apply for another program
            </Link>
          </div>

          {bookings.length > 0 ? (
            <div style={{ display: "grid", gap: "20px" }}>
              {bookings.map((booking) => (
                <div key={booking.id} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                        <span className="category-pill">{booking.service.category?.name || "Program"}</span>
                        <StatusBadge status={booking.status} />
                      </div>
                      <h3 style={{ fontSize: "20px", margin: "4px 0" }}>{booking.service.title}</h3>
                      <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>
                        Assigned Advisor: <strong>{booking.technician.user?.name || "Education Specialist"}</strong> · {booking.technician.location || "Global"}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "22px", fontWeight: "800", color: "var(--navy-950)", display: "block" }}>
                        {money(booking.totalAmount)}
                      </span>
                      <small style={{ color: "var(--muted)", fontSize: "12px" }}>Package Consultation Fee</small>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", padding: "16px", background: "var(--surface-alt)", borderRadius: "var(--radius-md)", marginBottom: "18px" }}>
                    <div>
                      <small style={{ color: "var(--muted)", display: "block", fontSize: "12px" }}>Scheduled Session</small>
                      <strong style={{ fontSize: "13.5px" }}>{formatDate(booking.scheduledAt)}</strong>
                    </div>
                    <div>
                      <small style={{ color: "var(--muted)", display: "block", fontSize: "12px" }}>Meeting / Location</small>
                      <strong style={{ fontSize: "13.5px" }}>{booking.address}</strong>
                    </div>
                    <div>
                      <small style={{ color: "var(--muted)", display: "block", fontSize: "12px" }}>Application Status</small>
                      <strong style={{ fontSize: "13.5px", color: "var(--magenta-600)" }}>{applicationStatusLabel(booking.status)}</strong>
                    </div>
                  </div>

                  {booking.note && (
                    <p style={{ fontSize: "13.5px", color: "#475569", background: "var(--surface-tint)", padding: "12px", borderRadius: "var(--radius-md)", margin: "0 0 18px 0" }}>
                      <strong>Student Note:</strong> {booking.note}
                    </p>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                    {cancellableStatuses.has(booking.status) && (
                      <button
                        type="button"
                        className="button button-ghost button-small danger-text"
                        onClick={() => cancelBooking(booking)}
                        disabled={workingId === booking.id}
                      >
                        Withdraw Application
                      </button>
                    )}

                    {booking.status === "ACCEPTED" && (
                      <button
                        type="button"
                        className="button button-primary button-small"
                        onClick={() => setPaymentBooking(booking)}
                        disabled={workingId === booking.id}
                      >
                        <CreditCard size={15} /> Pay Package Fee ({money(booking.totalAmount)})
                      </button>
                    )}

                    {booking.status === "COMPLETED" && !booking.review && (
                      <button
                        type="button"
                        className="button button-secondary button-small"
                        onClick={() => setReviewBooking(booking)}
                      >
                        <Star size={15} /> Leave Advisor Review
                      </button>
                    )}

                    {booking.review && (
                      <span style={{ fontSize: "13px", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                        <Star size={14} fill="#f59e0b" color="#f59e0b" /> You rated: {booking.review.rating}/5
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={GraduationCap}
              title="No applications yet"
              description="Start your study abroad journey by exploring thousands of programs and booking with a certified advisor."
              actionLabel="Explore Programs"
              onAction={() => window.location.assign("/services")}
            />
          )}
        </>
      )}

      {/* 3. 24/7 AI COUNSELLOR TAB */}
      {activeTab === "counsellor" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <span className="eyebrow muted-eyebrow">
                <Bot size={16} /> Intelligent Assistant
              </span>
              <h2>24/7 AI Study Abroad Counsellor</h2>
              <p>Instant answers to admission criteria, IELTS waivers, tuition budgets, visa policies, and airport assistance.</p>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "28px", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", minHeight: "360px", maxHeight: "500px", overflowY: "auto", paddingBottom: "20px" }}>
              {aiChatHistory.map((msg, index) => (
                <div
                  key={index}
                  style={{
                    alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    padding: "14px 18px",
                    borderRadius: "16px",
                    fontSize: "14.5px",
                    lineHeight: "1.6",
                    background: msg.sender === "user" ? "linear-gradient(135deg, var(--magenta-600) 0%, var(--magenta-500) 100%)" : "var(--surface-alt)",
                    color: msg.sender === "user" ? "#ffffff" : "var(--navy-950)",
                    border: msg.sender === "user" ? "none" : "1px solid var(--line)"
                  }}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            {/* Quick Chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", margin: "16px 0", paddingTop: "14px", borderTop: "1px solid var(--line-soft)" }}>
              <button
                type="button"
                className="ai-prompt-btn"
                style={{ color: "var(--magenta-600)", background: "var(--magenta-50)", border: "1px solid var(--magenta-100)" }}
                onClick={() => setAiChatInput("What scholarships are available in UK for January 2027?")}
              >
                🇬🇧 UK Scholarships
              </button>
              <button
                type="button"
                className="ai-prompt-btn"
                style={{ color: "var(--cyan-600)", background: "var(--cyan-50)", border: "1px solid var(--cyan-100)" }}
                onClick={() => setAiChatInput("Can I get admission without IELTS?")}
              >
                📝 IELTS Waivers
              </button>
              <button
                type="button"
                className="ai-prompt-btn"
                style={{ color: "var(--emerald-600)", background: "var(--emerald-50)", border: "1px solid var(--emerald-100)" }}
                onClick={() => setAiChatInput("How much bank statement funds do I need for Australia?")}
              >
                🇦🇺 Bank Solvency
              </button>
              <button
                type="button"
                className="ai-prompt-btn"
                style={{ color: "#475569", background: "var(--surface-alt)", border: "1px solid var(--line)" }}
                onClick={() => setAiChatInput("Tell me about NextED post-arrival airport pickup and housing.")}
              >
                ✈️ Post-Arrival Pickup
              </button>
            </div>

            <form onSubmit={handleAiQuestionSubmit} style={{ display: "flex", gap: "10px" }}>
              <input
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                placeholder="Ask any question about university requirements, visas, or deadlines..."
                style={{ flex: 1, padding: "12px 18px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", fontSize: "14.5px", outline: "none" }}
              />
              <button type="submit" className="button button-primary">
                Ask AI <Sparkles size={16} />
              </button>
            </form>
          </div>
        </>
      )}

      {/* 4. PAYMENTS TAB */}
      {activeTab === "payments" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <h2>Financial Records & Payment Receipts</h2>
              <p>Transparent receipts for university application packages and verified advisor fees.</p>
            </div>
          </div>

          {payments.length > 0 ? (
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Program / Description</th>
                    <th>Gateway Provider</th>
                    <th>Transaction ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        <strong>{payment.booking?.service?.title || "Consultation Package"}</strong>
                      </td>
                      <td>{payment.provider}</td>
                      <td>
                        <code style={{ fontSize: "12px" }}>{payment.transactionId.slice(0, 14)}...</code>
                      </td>
                      <td>{formatDate(payment.createdAt)}</td>
                      <td>
                        <StatusBadge status={payment.status} />
                      </td>
                      <td>
                        <strong>{money(payment.amount, payment.currency)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={CreditCard}
              title="No payment history"
              description="Invoices and receipts will appear here after an advisor accepts your application package."
            />
          )}
        </>
      )}

      {/* Payment Gateway Modal */}
      {paymentBooking && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Select Payment Gateway</h2>
              <button type="button" onClick={() => setPaymentBooking(null)}>✕</button>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "20px" }}>
              Complete the consultation package payment for <strong>{paymentBooking.service.title}</strong> ({money(paymentBooking.totalAmount)}).
            </p>
            <div style={{ display: "grid", gap: "12px" }}>
              <button
                type="button"
                className="button button-primary button-full"
                onClick={() => createPayment("STRIPE")}
                disabled={workingId === paymentBooking.id}
              >
                <CreditCard size={18} /> Pay with Stripe (International Card / Apple Pay)
              </button>
              <button
                type="button"
                className="button button-secondary button-full"
                onClick={() => createPayment("SSLCOMMERZ")}
                disabled={workingId === paymentBooking.id}
              >
                <WalletCards size={18} /> Pay with SSLCOMMERZ (Local / Global Cards)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2>Rate Your Education Advisor</h2>
              <button type="button" onClick={() => setReviewBooking(null)}>✕</button>
            </div>
            <form onSubmit={submitReview} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label className="field">
                <span>Rating (1 to 5 Stars)</span>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}
                  style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)" }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ 5 - Exceptional Guidance</option>
                  <option value={4}>⭐⭐⭐⭐ 4 - Very Helpful</option>
                  <option value={3}>⭐⭐⭐ 3 - Satisfactory</option>
                  <option value={2}>⭐⭐ 2 - Needs Improvement</option>
                  <option value={1}>⭐ 1 - Unsatisfactory</option>
                </select>
              </label>

              <label className="field">
                <span>Your Feedback Comment</span>
                <textarea
                  rows={4}
                  required
                  placeholder="Share how the advisor assisted you with course matching, documentation, or visa advice..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", resize: "vertical" }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="button button-ghost" onClick={() => setReviewBooking(null)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={workingId === reviewBooking.id}>
                  {workingId === reviewBooking.id ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
