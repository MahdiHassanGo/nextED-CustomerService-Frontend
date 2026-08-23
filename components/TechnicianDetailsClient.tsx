"use client";

import { Loading } from "@/components/Loading";
import { ServiceCard } from "@/components/ServiceCard";
import { api } from "@/lib/api-client";
import type { TechnicianProfile } from "@/lib/types";
import { formatDate, initials, money } from "@/lib/utils";
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Globe2,
  GraduationCap,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Star,
  Users
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const days = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

export function TechnicianDetailsClient({ id }: { id: string }) {
  const [technician, setTechnician] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void api.get<TechnicianProfile>(`/technicians/${id}`)
      .then((response) => setTechnician(response.data))
      .catch(() => setTechnician(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="section" style={{ minHeight: "400px", display: "grid", placeItems: "center" }}>
        <Loading label="Loading advisor credentials & consultation schedule..." />
      </div>
    );
  }

  if (!technician || !technician.user) {
    return (
      <div className="section">
        <div className="container" style={{ textAlign: "center", maxWidth: "500px", margin: "0 auto" }}>
          <Users size={48} style={{ color: "var(--magenta-500)", margin: "0 auto 16px auto" }} />
          <h2>Advisor profile not found</h2>
          <p style={{ color: "var(--muted)", marginBottom: "24px" }}>
            This advisor profile is currently unavailable or inactive.
          </p>
          <Link href="/technicians" className="button button-primary">
            Back to all advisors
          </Link>
        </div>
      </div>
    );
  }

  const rating = Number(technician.rating || 4.9).toFixed(1);
  const location = technician.location || technician.user?.location || "Global Online / UK / USA";
  const activeAvailability = technician.availability?.filter((slot) => slot.isAvailable) ?? [];

  return (
    <div className="detail-page">
      <div className="container">
        <Link href="/technicians" className="text-link" style={{ marginBottom: "24px" }}>
          <ArrowLeft size={16} /> Back to all education advisors
        </Link>

        {/* Advisor Header Hero */}
        <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "36px", marginBottom: "36px", boxShadow: "var(--shadow-sm)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <span className="avatar xlarge">{initials(technician.user.name)}</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span className="status-badge success">
                    <CheckCircle2 size={13} /> Verified Education Advisor
                  </span>
                </div>
                <h1 style={{ fontSize: "clamp(24px, 2.8vw, 36px)", margin: "0 0 8px 0" }}>{technician.user.name}</h1>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "16px", color: "var(--muted)", fontSize: "14px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Globe2 size={15} /> {location}
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <Briefcase size={15} /> {technician.experienceYears || 5} years admissions experience
                  </span>
                  <span className="rating">
                    <Star size={14} fill="currentColor" /> {rating} ({technician.totalReviews || 0} student reviews)
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
              <span style={{ fontSize: "28px", fontWeight: "850", color: "var(--navy-950)", fontFamily: "var(--font-heading)" }}>
                {money(technician.pricePerHour)}<small style={{ fontSize: "14px", color: "var(--muted)", fontWeight: "600" }}>/hr</small>
              </span>
              <a href="#services" className="button button-primary">
                View Consultation Packages
              </a>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-main">
            {/* Bio & Background */}
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "28px" }}>
              <h2 style={{ fontSize: "20px", marginBottom: "16px" }}>About the Advisor</h2>
              <p style={{ color: "#475569", fontSize: "15.5px", lineHeight: "1.7", whiteSpace: "pre-line" }}>
                {technician.bio || "Senior study abroad consultant assisting students with university selections, statement of purpose refinement, and visa approvals."}
              </p>

              <h3 style={{ fontSize: "16px", marginTop: "24px", marginBottom: "12px" }}>Admissions Specializations</h3>
              <div className="tag-list">
                {technician.skills && technician.skills.length > 0 ? (
                  technician.skills.map((skill) => <span key={skill}>{skill}</span>)
                ) : (
                  <span>UK Admissions · Visa Support · Scholarship Strategy</span>
                )}
              </div>
            </div>

            {/* Active Consultation Packages */}
            <div id="services">
              <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>Consultation & Admissions Packages</h2>
              {technician.services && technician.services.length > 0 ? (
                <div style={{ display: "grid", gap: "20px" }}>
                  {technician.services.map((service) => (
                    <div
                      key={service.id}
                      style={{
                        background: "#fff",
                        border: "1px solid var(--line)",
                        borderRadius: "var(--radius-lg)",
                        padding: "24px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "20px",
                        flexWrap: "wrap"
                      }}
                    >
                      <div style={{ maxWidth: "580px" }}>
                        <span className="category-pill" style={{ marginBottom: "8px" }}>
                          {service.category?.name || "Program"}
                        </span>
                        <h3 style={{ fontSize: "18px", margin: "6px 0" }}>{service.title}</h3>
                        <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>{service.description}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                        <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--navy-950)" }}>
                          {money(service.price)}
                        </span>
                        <Link href={`/services/${service.id}`} className="button button-primary button-small">
                          Book Package
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "28px", textAlign: "center", color: "var(--muted)" }}>
                  <GraduationCap size={32} style={{ margin: "0 auto 8px auto", color: "var(--cyan-600)" }} />
                  <p>Custom advisory sessions available directly on request.</p>
                </div>
              )}
            </div>

            {/* Verified Student Reviews */}
            <div>
              <h2 style={{ fontSize: "22px", marginBottom: "20px" }}>Verified Student Feedback</h2>
              {technician.reviews && technician.reviews.length > 0 ? (
                <div style={{ display: "grid", gap: "16px" }}>
                  {technician.reviews.map((review) => (
                    <div key={review.id} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                        <strong>{review.customer?.name || "Verified Student"}</strong>
                        <div className="rating">
                          <Star size={14} fill="currentColor" /> {review.rating}.0
                        </div>
                      </div>
                      <p style={{ color: "#475569", fontSize: "14px", margin: 0 }}>
                        {review.comment || "Extremely helpful consultation. Guided me step by step through my university choices and visa paperwork."}
                      </p>
                      <small style={{ color: "var(--muted)", display: "block", marginTop: "8px", fontSize: "12px" }}>
                        {formatDate(review.createdAt || new Date())}
                      </small>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "24px", color: "var(--muted)" }}>
                  <p style={{ margin: 0 }}>This advisor has a 100% positive recommendation track record with NextED students.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Availability */}
          <div className="detail-sidebar">
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "28px", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: "18px", display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <CalendarClock size={20} style={{ color: "var(--magenta-600)" }} /> Weekly Consultation Hours
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--muted)", marginBottom: "20px" }}>
                Active slots for live video and 1-on-1 strategy sessions.
              </p>

              {activeAvailability.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {days.map((day) => {
                    const slot = activeAvailability.find((s) => s.dayOfWeek === day);
                    return (
                      <div
                        key={day}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "13px",
                          padding: "8px 12px",
                          background: slot ? "var(--surface-alt)" : "transparent",
                          borderRadius: "var(--radius-sm)",
                          color: slot ? "var(--navy-950)" : "var(--muted)"
                        }}
                      >
                        <strong style={{ fontWeight: slot ? "700" : "500" }}>{day.slice(0, 3)}</strong>
                        <span>{slot ? `${slot.startTime} - ${slot.endTime}` : "Closed"}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ padding: "16px", background: "var(--surface-tint)", borderRadius: "var(--radius-md)", fontSize: "13px", color: "#475569" }}>
                  <p style={{ margin: 0 }}>Mon – Fri: 09:00 AM – 06:00 PM (GMT). Instant bookings confirmed upon submission.</p>
                </div>
              )}

              <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--line)" }}>
                <a href="#services" className="button button-primary button-full">
                  Book with {technician.user.name.split(" ")[0]}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
