"use client";

import { useAuth } from "@/components/AuthProvider";
import { Loading } from "@/components/Loading";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import { sanitizeInput } from "@/lib/security";
import type { Booking, Service } from "@/lib/types";
import { formatDate, getErrorMessage, initials, money } from "@/lib/utils";
import {
  ArrowLeft,
  BadgeCheck,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

function toLocalDateTimeInput(date: Date) {
  const localTime = date.getTime() - date.getTimezoneOffset() * 60_000;
  return new Date(localTime).toISOString().slice(0, 16);
}

export function ServiceDetailsClient({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ scheduledAt: "", address: "", note: "" });

  useEffect(() => {
    void api.get<Service>(`/services/${id}`)
      .then((response) => setService(response.data))
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function book(event: FormEvent) {
    event.preventDefault();
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(`/services/${id}`)}`);
      return;
    }
    if (user.role !== "CUSTOMER") {
      toast.error("Only Student accounts can request admissions consultations.");
      return;
    }
    setSaving(true);
    try {
      const sanitizedAddress = sanitizeInput(form.address);
      const sanitizedNote = sanitizeInput(form.note);

      const payload = {
        serviceId: service?.id,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        address: sanitizedAddress || user.location || "Online Consultation / Zoom",
        note: sanitizedNote || undefined
      };

      const response = await api.post<Booking>("/bookings", payload);
      toast.success(response.message || "Consultation request submitted! Your advisor will review it shortly.");
      router.push("/dashboard?tab=bookings");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="section" style={{ minHeight: "400px", display: "grid", placeItems: "center" }}>
        <Loading label="Loading study program & consultation details..." />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="section">
        <div className="container" style={{ textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
          <GraduationCap size={48} style={{ color: "var(--magenta-500)", margin: "0 auto 16px auto" }} />
          <h2>Program not found</h2>
          <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
            The requested university program or consultation package is currently unavailable or has been archived.
          </p>
          <Link href="/services" className="button button-primary">
            Explore all study programs
          </Link>
        </div>
      </div>
    );
  }

  const technician = service.technician;
  const rating = technician.rating ? Number(technician.rating).toFixed(1) : "4.9";
  const location = service.location || technician.location || "Global Online / Multiple Destinations";
  const defaultSchedule = new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <div className="detail-page">
      <div className="container">
        <Link href="/services" className="text-link" style={{ marginBottom: "24px" }}>
          <ArrowLeft size={16} /> Back to all programs
        </Link>

        <div className="detail-grid">
          {/* Main Program & Package Details */}
          <div className="detail-main">
            <div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                <span className="category-pill">{service.category?.name || "Degree Program"}</span>
                <span className="rating">
                  <Star size={14} fill="currentColor" /> {rating} ({technician.totalReviews || 0} reviews)
                </span>
              </div>
              <h1 style={{ fontSize: "clamp(28px, 3vw, 42px)", marginBottom: "16px" }}>{service.title}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "var(--muted)", fontSize: "14.5px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Globe2 size={16} /> {location}
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={16} /> AI-Verified Admission Criteria
                </span>
              </div>
            </div>

            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "28px" }}>
              <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>Program & Consultation Scope</h2>
              <p style={{ color: "#475569", fontSize: "15.5px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                {service.description}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginTop: "24px" }}>
                <div style={{ padding: "16px", background: "var(--surface-tint)", borderRadius: "var(--radius-md)", border: "1px solid var(--cyan-100)" }}>
                  <small style={{ color: "var(--muted)", fontWeight: "600", display: "block" }}>1. University Matching</small>
                  <strong style={{ color: "var(--navy-950)", fontSize: "14px" }}>Target, Reach & Safety Lists</strong>
                </div>
                <div style={{ padding: "16px", background: "var(--surface-tint)", borderRadius: "var(--radius-md)", border: "1px solid var(--cyan-100)" }}>
                  <small style={{ color: "var(--muted)", fontWeight: "600", display: "block" }}>2. Document & SOP Review</small>
                  <strong style={{ color: "var(--navy-950)", fontSize: "14px" }}>AI & Expert Proofreading</strong>
                </div>
                <div style={{ padding: "16px", background: "var(--surface-tint)", borderRadius: "var(--radius-md)", border: "1px solid var(--cyan-100)" }}>
                  <small style={{ color: "var(--muted)", fontWeight: "600", display: "block" }}>3. Visa & Post-Arrival</small>
                  <strong style={{ color: "var(--navy-950)", fontSize: "14px" }}>Full Filing & Housing Guidance</strong>
                </div>
              </div>
            </div>

            {/* University Advisor Card */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "28px" }}>
              <h2 style={{ fontSize: "20px", marginBottom: "18px" }}>Assigned Education Consultant</h2>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <span className="avatar large">{initials(technician.user?.name || "Advisor")}</span>
                <div>
                  <h3 style={{ fontSize: "18px", margin: "0 0 4px 0" }}>
                    <Link href={`/technicians/${technician.id}`}>{technician.user?.name || "University Advisor"}</Link>
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--muted)", fontSize: "13px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--cyan-600)", fontWeight: "700" }}>
                      <CheckCircle2 size={14} /> Licensed Advisor
                    </span>
                    <span>·</span>
                    <span>{technician.experienceYears || 5}+ years global admissions experience</span>
                  </div>
                </div>
              </div>
              <p style={{ color: "#64748b", fontSize: "14.5px", lineHeight: "1.6" }}>
                {technician.bio || "Senior study abroad consultant assisting students with university selections, statement of purpose refinement, and visa approvals."}
              </p>
              <div className="tag-list" style={{ marginTop: "14px" }}>
                {technician.skills?.map((skill) => (
                  <span key={skill}>{skill}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Booking Sidebar */}
          <div className="detail-sidebar">
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "28px", boxShadow: "var(--shadow-md)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "20px" }}>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--muted)" }}>Package Fee</span>
                <span style={{ fontSize: "28px", fontWeight: "850", color: "var(--navy-950)", fontFamily: "var(--font-heading)" }}>
                  {money(service.price)}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", color: "#475569" }}>
                  <CheckCircle2 size={16} style={{ color: "var(--emerald-600)" }} /> 1-on-1 Strategy Video Consultation
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", color: "#475569" }}>
                  <CheckCircle2 size={16} style={{ color: "var(--emerald-600)" }} /> AI Course Matching & University Ranking
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", color: "#475569" }}>
                  <CheckCircle2 size={16} style={{ color: "var(--emerald-600)" }} /> Real-time Application Tracking & Updates
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13.5px", color: "#475569" }}>
                  <CheckCircle2 size={16} style={{ color: "var(--emerald-600)" }} /> 98% Visa Success Guarantee
                </div>
              </div>

              {!bookingOpen ? (
                <button
                  type="button"
                  className="button button-primary button-full button-large"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, scheduledAt: prev.scheduledAt || toLocalDateTimeInput(defaultSchedule) }));
                    setBookingOpen(true);
                  }}
                >
                  <CalendarDays size={18} /> Schedule Consultation Session
                </button>
              ) : (
                <form onSubmit={book} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <label className="field">
                    <span>Preferred Consultation Date & Time</span>
                    <input
                      type="datetime-local"
                      required
                      min={toLocalDateTimeInput(new Date())}
                      value={form.scheduledAt}
                      onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                      style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)" }}
                    />
                  </label>

                  <label className="field">
                    <span>Student Contact / Location / Meeting Medium</span>
                    <input
                      required
                      placeholder="e.g. Zoom Video Consultation (Dhaka / London)"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)" }}
                    />
                  </label>

                  <label className="field">
                    <span>Academic Background & Questions (Optional)</span>
                    <textarea
                      rows={3}
                      placeholder="e.g. Completed BSc in CSE (CGPA 3.6), IELTS 7.5. Looking for UK January intake with scholarship."
                      value={form.note}
                      onChange={(e) => setForm({ ...form, note: e.target.value })}
                      style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", resize: "vertical" }}
                    />
                  </label>

                  <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                    <button type="submit" className="button button-primary button-full" disabled={saving}>
                      {saving ? "Submitting..." : "Confirm & Send to Advisor"}
                    </button>
                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() => setBookingOpen(false)}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <p style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12px", color: "var(--muted)", marginTop: "16px" }}>
                <ShieldCheck size={14} /> NextED AI-Protected Session Guarantee
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
