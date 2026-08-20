"use client";

import { useAuth } from "@/components/AuthProvider";
import { Loading } from "@/components/Loading";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import type { Booking, Service } from "@/lib/types";
import { formatDate, getErrorMessage, initials, money } from "@/lib/utils";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
  UserRound,
  Wrench
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
      toast.error("Only customer accounts can request bookings.");
      return;
    }
    setSaving(true);
    try {
      const response = await api.post<Booking>("/bookings", {
        serviceId: id,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        address: form.address,
        note: form.note || undefined
      });
      toast.success(response.message);
      setBookingOpen(false);
      router.push("/dashboard?tab=bookings");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="detail-loading">
        <Loading label="Loading service details" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container not-found-card">
        <Wrench size={36} />
        <h1>Service not found</h1>
        <p>This listing may be unavailable or has been removed.</p>
        <Link href="/services" className="button button-primary">
          Back to services
        </Link>
      </div>
    );
  }

  const tech = service.technician;
  const rating = tech.rating ? Number(tech.rating).toFixed(1) : "0.0";
  const location = service.location || tech.location || "Bangladesh";

  return (
    <div className="detail-page">
      <div className="container">
        <Link href="/services" className="back-link">
          <ArrowLeft size={17} /> Back to services
        </Link>
      </div>

      <section className="container service-detail-grid">
        <div className="detail-content">
          <div className="detail-title-row">
            <div>
              <span className="category-pill">{service.category?.name || "Service"}</span>
              <h1>{service.title}</h1>
              <div className="detail-submeta">
                <span>
                  <Star size={16} fill="currentColor" /> {rating} ({tech.totalReviews || 0} reviews)
                </span>
                <span>
                  <MapPin size={16} /> {location}
                </span>
              </div>
            </div>
            <span className="service-icon detail-service-icon" aria-hidden="true">
              {service.category?.name ? service.category.name.charAt(0).toUpperCase() : "S"}
            </span>
          </div>

          <article className="detail-section">
            <h2>About this service</h2>
            <p className="detail-description">{service.description}</p>
          </article>

          <article className="detail-section">
            <h2>What makes this booking secure</h2>
            <div className="feature-list">
              <span>
                <CheckCircle2 size={20} />
                <span>
                  <strong>Availability validation</strong>
                  <small>The requested time must match the technician&apos;s published weekly schedule.</small>
                </span>
              </span>
              <span>
                <ShieldCheck size={20} />
                <span>
                  <strong>Role-protected workflow</strong>
                  <small>Only the assigned technician can accept, start, or complete the job.</small>
                </span>
              </span>
              <span>
                <BadgeCheck size={20} />
                <span>
                  <strong>Verified payment state</strong>
                  <small>The booking is marked paid only after server-side gateway confirmation.</small>
                </span>
              </span>
            </div>
          </article>

          <article className="detail-section">
            <h2>Service information</h2>
            <div className="info-grid">
              <span>
                <Wrench size={20} />
                <small>Category</small>
                <strong>{service.category?.name || "General"}</strong>
              </span>
              <span>
                <MapPin size={20} />
                <small>Service area</small>
                <strong>{location}</strong>
              </span>
              <span>
                <CalendarDays size={20} />
                <small>Listed on</small>
                <strong>{formatDate(service.createdAt, { dateStyle: "medium", timeStyle: undefined })}</strong>
              </span>
              <span>
                <ShieldCheck size={20} />
                <small>Status</small>
                <strong>Active verified listing</strong>
              </span>
            </div>
          </article>
        </div>

        <aside className="booking-card">
          <span className="booking-price">
            <small>Service price</small>
            <strong>{money(service.price)}</strong>
          </span>

          <div className="provider-profile">
            <span className="avatar large">{initials(tech.user?.name || "Tech")}</span>
            <span>
              <small>Provided by</small>
              <strong>{tech.user?.name || "Technician"}</strong>
              <span className="verified-line">
                <BadgeCheck size={14} /> Verified technician
              </span>
            </span>
          </div>

          <div className="provider-stats">
            <span>
              <strong>{tech.experienceYears || 0}</strong>
              <small>Years experience</small>
            </span>
            <span>
              <strong>{rating}</strong>
              <small>Average rating</small>
            </span>
            <span>
              <strong>{tech.totalReviews || 0}</strong>
              <small>Total reviews</small>
            </span>
          </div>

          <Link className="button button-secondary button-full" href={`/technicians/${tech.id}`}>
            <UserRound size={17} /> View full profile
          </Link>

          <button
            type="button"
            className="button button-primary button-full button-large"
            onClick={() => {
              if (!user) {
                router.push(`/auth/login?next=${encodeURIComponent(`/services/${id}`)}`);
                return;
              }
              if (user.role !== "CUSTOMER") {
                toast.error("Only customer accounts can request bookings.");
                return;
              }
              setBookingOpen(true);
            }}
          >
            <CalendarDays size={18} /> Request this service
          </button>

          <p className="booking-note">
            <ShieldCheck size={15} /> Your request is checked against live availability before reservation.
          </p>
        </aside>
      </section>

      {bookingOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setBookingOpen(false);
          }}
        >
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="booking-title">
            <div className="modal-head">
              <div>
                <span className="eyebrow muted-eyebrow">Secure request</span>
                <h2 id="booking-title">Book {service.title}</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setBookingOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={book}>
              <label className="field">
                <span>Date and time</span>
                <div className="input-icon">
                  <Clock3 size={17} />
                  <input
                    type="datetime-local"
                    required
                    min={toLocalDateTimeInput(new Date(Date.now() + 60 * 60 * 1000))}
                    value={form.scheduledAt}
                    onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })}
                  />
                </div>
                <small>The backend will validate the technician&apos;s timezone and weekly availability.</small>
              </label>

              <label className="field">
                <span>Service address</span>
                <textarea
                  required
                  minLength={5}
                  maxLength={500}
                  rows={3}
                  value={form.address}
                  onChange={(event) => setForm({ ...form, address: event.target.value })}
                  placeholder="House, road, area, city"
                />
              </label>

              <label className="field">
                <span>
                  Additional note <small>(optional)</small>
                </span>
                <textarea
                  maxLength={1500}
                  rows={4}
                  value={form.note}
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                  placeholder="Describe the issue or access instructions"
                />
              </label>

              <div className="modal-actions">
                <button
                  type="button"
                  className="button button-ghost"
                  onClick={() => setBookingOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-primary"
                  disabled={saving}
                >
                  {saving ? "Requesting…" : "Confirm request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
