"use client";

import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import { sanitizeInput } from "@/lib/security";
import type {
  Availability,
  Booking,
  BookingStatus,
  Category,
  DayOfWeek,
  PublicUser,
  Service,
  TechnicianProfile
} from "@/lib/types";
import { applicationStatusLabel, formatDate, getErrorMessage, money } from "@/lib/utils";
import {
  BadgeCheck,
  BookOpenCheck,
  Briefcase,
  CalendarCheck2,
  CalendarClock,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  Edit3,
  Globe2,
  GraduationCap,
  Layers,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  X
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const DAYS: DayOfWeek[] = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY"
];

const nextActions: Partial<Record<BookingStatus, Array<{ status: BookingStatus; label: string; tone: string }>>> = {
  REQUESTED: [
    { status: "ACCEPTED", label: "Accept Consultation", tone: "primary" },
    { status: "DECLINED", label: "Decline", tone: "danger" }
  ],
  PAID: [{ status: "IN_PROGRESS", label: "Start Application Review", tone: "primary" }],
  IN_PROGRESS: [{ status: "COMPLETED", label: "Complete & Issue Guidance", tone: "primary" }]
};

type ServiceForm = {
  id?: string;
  title: string;
  description: string;
  price: string;
  location: string;
  categoryId: string;
  isActive: boolean;
};

interface TechnicianDashboardProps {
  user: PublicUser;
  activeTab: string;
  onUserUpdated?: (user: PublicUser) => void;
}

export function TechnicianDashboard({ user, activeTab }: TechnicianDashboardProps) {
  const toast = useToast();
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availability, setAvailability] = useState<Record<DayOfWeek, { startTime: string; endTime: string; isAvailable: boolean }>>({
    SATURDAY: { startTime: "09:00", endTime: "17:00", isAvailable: true },
    SUNDAY: { startTime: "09:00", endTime: "17:00", isAvailable: true },
    MONDAY: { startTime: "09:00", endTime: "17:00", isAvailable: true },
    TUESDAY: { startTime: "09:00", endTime: "17:00", isAvailable: true },
    WEDNESDAY: { startTime: "09:00", endTime: "17:00", isAvailable: true },
    THURSDAY: { startTime: "09:00", endTime: "17:00", isAvailable: true },
    FRIDAY: { startTime: "09:00", endTime: "13:00", isAvailable: false }
  });
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [serviceModal, setServiceModal] = useState<ServiceForm | null>(null);
  const [savingService, setSavingService] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [profileResult, bookingResult, serviceResult, categoryResult] = await Promise.allSettled([
      api.get<TechnicianProfile>("/technicians/me"),
      api.get<Booking[]>("/technicians/bookings"),
      api.get<Service[]>("/technicians/services"),
      api.get<Category[]>("/categories")
    ]);

    if (profileResult.status === "fulfilled") {
      const data = profileResult.value.data;
      setProfile(data);
      if (data.availability && data.availability.length > 0) {
        const mapped = { ...availability };
        data.availability.forEach((slot) => {
          if (mapped[slot.dayOfWeek]) {
            mapped[slot.dayOfWeek] = {
              startTime: slot.startTime,
              endTime: slot.endTime,
              isAvailable: slot.isAvailable
            };
          }
        });
        setAvailability(mapped);
      }
    }
    if (bookingResult.status === "fulfilled") setBookings(bookingResult.value.data);
    if (serviceResult.status === "fulfilled") setServices(serviceResult.value.data);
    if (categoryResult.status === "fulfilled") setCategories(categoryResult.value.data);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const requested = bookings.filter((b) => b.status === "REQUESTED").length;
    const inProgress = bookings.filter((b) => ["ACCEPTED", "PAID", "IN_PROGRESS"].includes(b.status)).length;
    const completed = bookings.filter((b) => b.status === "COMPLETED").length;
    const activePackages = services.filter((s) => s.isActive).length;
    return { total, requested, inProgress, completed, activePackages };
  }, [bookings, services]);

  async function updateBookingStatus(bookingId: string, nextStatus: BookingStatus) {
    setWorkingId(bookingId);
    try {
      const response = await api.patch<Booking>(`/technicians/bookings/${bookingId}/status`, {
        status: nextStatus
      });
      toast.success(response.message || `Application status updated to ${applicationStatusLabel(nextStatus)}`);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  async function saveService(event: FormEvent) {
    event.preventDefault();
    if (!serviceModal) return;
    setSavingService(true);
    try {
      const payload = {
        title: sanitizeInput(serviceModal.title),
        description: sanitizeInput(serviceModal.description),
        price: Number(serviceModal.price),
        location: sanitizeInput(serviceModal.location) || undefined,
        categoryId: serviceModal.categoryId,
        isActive: serviceModal.isActive
      };

      if (serviceModal.id) {
        const response = await api.patch<Service>(`/services/${serviceModal.id}`, payload);
        toast.success(response.message || "Consultation package updated successfully.");
      } else {
        const response = await api.post<Service>("/services", payload);
        toast.success(response.message || "New consultation package published.");
      }
      setServiceModal(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingService(false);
    }
  }

  async function toggleServiceStatus(service: Service) {
    setWorkingId(service.id);
    try {
      const response = await api.patch<Service>(`/services/${service.id}`, {
        isActive: !service.isActive
      });
      toast.success(response.message || "Package status updated.");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  async function deleteService(service: Service) {
    if (!window.confirm(`Delete the consultation package “${service.title}”?`)) return;
    setWorkingId(service.id);
    try {
      const response = await api.delete(`/services/${service.id}`);
      toast.success(response.message || "Package removed.");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  async function saveAvailabilitySlots(event: FormEvent) {
    event.preventDefault();
    setSavingAvailability(true);
    try {
      const slots = Object.entries(availability).map(([dayOfWeek, slot]) => ({
        dayOfWeek: dayOfWeek as DayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: slot.isAvailable
      }));
      const response = await api.put<{ availability: Availability[] }>("/technicians/availability", {
        slots
      });
      toast.success(response.message || "Weekly consultation schedule updated successfully.");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingAvailability(false);
    }
  }

  if (loading) {
    return <Loading label="Loading advisor management portal..." />;
  }

  return (
    <div>
      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <span className="eyebrow muted-eyebrow">
                <Sparkles size={16} /> Education Advisor Workspace
              </span>
              <h2>Advisor Portal: {user.name}</h2>
              <p>Manage student admission inquiries, conduct 1-on-1 strategy sessions, and update application milestones.</p>
            </div>
            <button
              type="button"
              className="button button-primary"
              onClick={() =>
                setServiceModal({
                  title: "",
                  description: "",
                  price: "350",
                  location: user.location || "UK & USA Admissions",
                  categoryId: categories[0]?.id || "",
                  isActive: true
                })
              }
            >
              <Plus size={17} /> New Consultation Package
            </button>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <BookOpenCheck size={24} />
              </div>
              <div className="stat-info">
                <small>Total Inquiries</small>
                <strong>{stats.total}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon cyan">
                <Clock3 size={24} />
              </div>
              <div className="stat-info">
                <small>Pending Approval</small>
                <strong>{stats.requested}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Layers size={24} />
              </div>
              <div className="stat-info">
                <small>Active Reviews</small>
                <strong>{stats.inProgress}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon cyan">
                <CheckCircle2 size={24} />
              </div>
              <div className="stat-info">
                <small>Admitted Students</small>
                <strong>{stats.completed}</strong>
              </div>
            </div>
          </div>

          {/* Pending Inquiries Quick Alert */}
          {stats.requested > 0 && (
            <div style={{ background: "var(--magenta-50)", border: "1px solid var(--magenta-100)", borderRadius: "var(--radius-xl)", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "32px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Sparkles size={24} style={{ color: "var(--magenta-600)" }} />
                <div>
                  <strong style={{ color: "var(--navy-950)", fontSize: "15px" }}>You have {stats.requested} pending student consultation request{stats.requested > 1 ? "s" : ""}</strong>
                  <p style={{ color: "#64748b", fontSize: "13.5px", margin: 0 }}>Review student academic background and confirm session time.</p>
                </div>
              </div>
              <button
                type="button"
                className="button button-magenta button-small"
                onClick={() => {
                  const tabBtn = document.querySelector('button:has(svg.lucide-book-open-check)') as HTMLButtonElement | null;
                  tabBtn?.click();
                }}
              >
                View Inquiries Queue
              </button>
            </div>
          )}
        </>
      )}

      {/* 2. STUDENT QUEUE TAB */}
      {activeTab === "bookings" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <h2>Assigned Student Applications & Inquiries Queue</h2>
              <p>Accept new inquiries, track student admission stages, and complete strategy guidance.</p>
            </div>
          </div>

          {bookings.length > 0 ? (
            <div style={{ display: "grid", gap: "20px" }}>
              {bookings.map((booking) => {
                const actions = nextActions[booking.status] ?? [];
                return (
                  <div key={booking.id} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "16px" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                          <span className="category-pill">{booking.service.category?.name || "Program"}</span>
                          <StatusBadge status={booking.status} />
                        </div>
                        <h3 style={{ fontSize: "20px", margin: "4px 0" }}>{booking.service.title}</h3>
                        <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>
                          Student: <strong>{booking.customer.name}</strong> · {booking.customer.email} · {booking.customer.phone || "No phone provided"}
                        </p>
                      </div>

                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "22px", fontWeight: "800", color: "var(--navy-950)", display: "block" }}>
                          {money(booking.totalAmount)}
                        </span>
                        <small style={{ color: "var(--muted)", fontSize: "12px" }}>Package Fee</small>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", padding: "16px", background: "var(--surface-alt)", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
                      <div>
                        <small style={{ color: "var(--muted)", display: "block", fontSize: "12px" }}>Scheduled Date & Time</small>
                        <strong style={{ fontSize: "13.5px" }}>{formatDate(booking.scheduledAt)}</strong>
                      </div>
                      <div>
                        <small style={{ color: "var(--muted)", display: "block", fontSize: "12px" }}>Meeting Medium / Location</small>
                        <strong style={{ fontSize: "13.5px" }}>{booking.address}</strong>
                      </div>
                      <div>
                        <small style={{ color: "var(--muted)", display: "block", fontSize: "12px" }}>Milestone Progress</small>
                        <strong style={{ fontSize: "13.5px", color: "var(--magenta-600)" }}>{applicationStatusLabel(booking.status)}</strong>
                      </div>
                    </div>

                    {booking.note && (
                      <div style={{ background: "var(--surface-tint)", border: "1px solid var(--cyan-100)", borderRadius: "var(--radius-md)", padding: "12px 16px", marginBottom: "16px" }}>
                        <small style={{ color: "var(--muted)", fontWeight: "700", display: "block" }}>Student Background & Notes:</small>
                        <p style={{ color: "var(--navy-950)", fontSize: "13.5px", margin: "4px 0 0 0" }}>{booking.note}</p>
                      </div>
                    )}

                    {/* Next Action Buttons */}
                    {actions.length > 0 && (
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "16px", paddingTop: "14px", borderTop: "1px solid var(--line-soft)" }}>
                        {actions.map((act) => (
                          <button
                            key={act.status}
                            type="button"
                            className={`button button-small ${act.tone === "primary" ? "button-primary" : "button-ghost danger-text"}`}
                            onClick={() => updateBookingStatus(booking.id, act.status)}
                            disabled={workingId === booking.id}
                          >
                            {act.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<BookOpenCheck size={28} />}
              title="No student inquiries assigned"
              description="New consultation bookings and application review requests will appear here."
            />
          )}
        </>
      )}

      {/* 3. CONSULTATION PACKAGES TAB */}
      {activeTab === "services" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <h2>My Study Abroad Packages & Advisory Offerings</h2>
              <p>Publish admissions packages, visa consultation services, and scholarship review offerings.</p>
            </div>
            <button
              type="button"
              className="button button-primary button-small"
              onClick={() =>
                setServiceModal({
                  title: "",
                  description: "",
                  price: "350",
                  location: user.location || "UK & USA Admissions",
                  categoryId: categories[0]?.id || "",
                  isActive: true
                })
              }
            >
              <Plus size={17} /> Add Package
            </button>
          </div>

          {services.length > 0 ? (
            <div style={{ display: "grid", gap: "16px" }}>
              {services.map((service) => (
                <div
                  key={service.id}
                  style={{
                    background: "#fff",
                    border: "1px solid var(--line)",
                    borderRadius: "var(--radius-lg)",
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap"
                  }}
                >
                  <div style={{ maxWidth: "600px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span className="category-pill">{service.category?.name || "Program"}</span>
                      <span className={`status-badge ${service.isActive ? "success" : "muted"}`}>
                        {service.isActive ? "Live on Directory" : "Archived"}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "18px", margin: "4px 0" }}>{service.title}</h3>
                    <p style={{ color: "var(--muted)", fontSize: "14px", margin: 0 }}>{service.description}</p>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <span style={{ fontSize: "20px", fontWeight: "800", color: "var(--navy-950)" }}>
                      {money(service.price)}
                    </span>
                    <button
                      type="button"
                      className="button button-ghost button-small"
                      onClick={() =>
                        setServiceModal({
                          id: service.id,
                          title: service.title,
                          description: service.description,
                          price: String(service.price),
                          location: service.location || "",
                          categoryId: service.categoryId,
                          isActive: service.isActive
                        })
                      }
                    >
                      <Edit3 size={15} /> Edit
                    </button>
                    <button
                      type="button"
                      className="button button-ghost button-small"
                      onClick={() => toggleServiceStatus(service)}
                      disabled={workingId === service.id}
                    >
                      {service.isActive ? "Archive" : "Activate"}
                    </button>
                    <button
                      type="button"
                      className="icon-button compact danger-text"
                      onClick={() => deleteService(service)}
                      disabled={workingId === service.id}
                      title="Delete package"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<GraduationCap size={28} />}
              title="No consultation packages published"
              description="Create your first advisory package to allow students to book 1-on-1 strategy sessions with you."
              action={
                <button
                  type="button"
                  className="button button-primary button-small"
                  onClick={() =>
                    setServiceModal({
                      title: "",
                      description: "",
                      price: "350",
                      location: user.location || "UK & USA Admissions",
                      categoryId: categories[0]?.id || "",
                      isActive: true
                    })
                  }
                >
                  Create Package
                </button>
              }
            />
          )}
        </>
      )}

      {/* 4. WEEKLY AVAILABILITY TAB */}
      {activeTab === "availability" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <h2>Weekly Student Consultation Hours</h2>
              <p>Configure day-by-day availability slots for students booking strategy sessions and video calls.</p>
            </div>
          </div>

          <form onSubmit={saveAvailabilitySlots} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "28px", maxWidth: "680px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "28px" }}>
              {DAYS.map((day) => {
                const slot = availability[day];
                return (
                  <div
                    key={day}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      background: slot.isAvailable ? "var(--surface-alt)" : "transparent",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--line-soft)",
                      gap: "16px",
                      flexWrap: "wrap"
                    }}
                  >
                    <label style={{ display: "flex", alignItems: "center", gap: "10px", width: "140px", cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={slot.isAvailable}
                        onChange={(e) =>
                          setAvailability({
                            ...availability,
                            [day]: { ...slot, isAvailable: e.target.checked }
                          })
                        }
                      />
                      <strong style={{ fontSize: "14px", color: slot.isAvailable ? "var(--navy-950)" : "var(--muted)" }}>
                        {day}
                      </strong>
                    </label>

                    {slot.isAvailable ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            setAvailability({
                              ...availability,
                              [day]: { ...slot, startTime: e.target.value }
                            })
                          }
                          style={{ padding: "6px 10px", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)" }}
                        />
                        <span style={{ color: "var(--muted)" }}>to</span>
                        <input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            setAvailability({
                              ...availability,
                              [day]: { ...slot, endTime: e.target.value }
                            })
                          }
                          style={{ padding: "6px 10px", border: "1px solid var(--line)", borderRadius: "var(--radius-sm)" }}
                        />
                      </div>
                    ) : (
                      <span style={{ fontSize: "13px", color: "var(--muted)" }}>Unavailable</span>
                    )}
                  </div>
                );
              })}
            </div>

            <button type="submit" className="button button-primary" disabled={savingAvailability}>
              <Save size={16} /> {savingAvailability ? "Saving Schedule..." : "Save Consultation Schedule"}
            </button>
          </form>
        </>
      )}

      {/* Service Modal */}
      {serviceModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{serviceModal.id ? "Edit Consultation Package" : "New Admissions Package"}</h2>
              <button type="button" onClick={() => setServiceModal(null)}>✕</button>
            </div>
            <form onSubmit={saveService} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label className="field">
                <span>Package Title</span>
                <input
                  required
                  placeholder="e.g. UK Russell Group Master's Admissions & Visa Package"
                  value={serviceModal.title}
                  onChange={(e) => setServiceModal({ ...serviceModal, title: e.target.value })}
                  style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)" }}
                />
              </label>

              <label className="field">
                <span>Academic Discipline / Category</span>
                <select
                  required
                  value={serviceModal.categoryId}
                  onChange={(e) => setServiceModal({ ...serviceModal, categoryId: e.target.value })}
                  style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)" }}
                >
                  <option value="" disabled>Select discipline</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="field">
                  <span>Package Fee ($ USD)</span>
                  <input
                    type="number"
                    min={0}
                    required
                    value={serviceModal.price}
                    onChange={(e) => setServiceModal({ ...serviceModal, price: e.target.value })}
                    style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)" }}
                  />
                </label>

                <label className="field">
                  <span>Target Destination / Country</span>
                  <input
                    placeholder="e.g. United Kingdom, USA, Australia"
                    value={serviceModal.location}
                    onChange={(e) => setServiceModal({ ...serviceModal, location: e.target.value })}
                    style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)" }}
                  />
                </label>
              </div>

              <label className="field">
                <span>Package Scope & Description</span>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail what is included: university shortlisting, SOP proofreading, scholarship guidance, mock visa interview, etc."
                  value={serviceModal.description}
                  onChange={(e) => setServiceModal({ ...serviceModal, description: e.target.value })}
                  style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", resize: "vertical" }}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                <input
                  type="checkbox"
                  checked={serviceModal.isActive}
                  onChange={(e) => setServiceModal({ ...serviceModal, isActive: e.target.checked })}
                />
                <span>Publish as active package on public directory</span>
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button type="button" className="button button-ghost" onClick={() => setServiceModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={savingService}>
                  {savingService ? "Saving..." : serviceModal.id ? "Save Changes" : "Publish Package"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
