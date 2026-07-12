"use client";

import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import type { Availability, Booking, BookingStatus, Category, DayOfWeek, PublicUser, Service, TechnicianProfile } from "@/lib/types";
import { formatDate, getErrorMessage, money } from "@/lib/utils";
import { BadgeCheck, BriefcaseBusiness, CalendarCheck2, Check, Clock3, Edit3, MapPin, Plus, Save, ShieldCheck, Star, Trash2, Wrench, X } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

const DAYS: DayOfWeek[] = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
const nextActions: Partial<Record<BookingStatus, Array<{ status: BookingStatus; label: string; tone: string }>>> = {
  REQUESTED: [{ status: "ACCEPTED", label: "Accept", tone: "primary" }, { status: "DECLINED", label: "Decline", tone: "danger" }],
  PAID: [{ status: "IN_PROGRESS", label: "Start job", tone: "primary" }],
  IN_PROGRESS: [{ status: "COMPLETED", label: "Complete job", tone: "primary" }]
};

type ServiceForm = { id?: string; title: string; description: string; price: string; location: string; categoryId: string; isActive: boolean };
const emptyService: ServiceForm = { title: "", description: "", price: "", location: "", categoryId: "", isActive: true };

export function TechnicianDashboard({ user, activeTab, onUserUpdated }: { user: PublicUser; activeTab: string; onUserUpdated: (user: PublicUser) => void }) {
  const toast = useToast();
  const [profile, setProfile] = useState<TechnicianProfile | null>(user.technicianProfile ?? null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [serviceModal, setServiceModal] = useState<ServiceForm | null>(null);
  const [profileForm, setProfileForm] = useState({ bio: "", skills: "", experienceYears: "0", pricePerHour: "0", location: "", timezone: "Asia/Dhaka" });
  const [availability, setAvailability] = useState<Array<Pick<Availability, "dayOfWeek" | "startTime" | "endTime" | "isAvailable">>>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const profileId = user.technicianProfile?.id ?? user.id;
    const [profileResult, bookingResult, serviceResult, categoryResult] = await Promise.allSettled([
      api.get<TechnicianProfile>(`/technicians/${profileId}`),
      api.get<Booking[]>("/technician/bookings"),
      api.get<Service[]>("/services/mine"),
      api.get<Category[]>("/categories")
    ]);
    if (profileResult.status === "fulfilled") {
      const item = profileResult.value.data;
      setProfile(item);
      setProfileForm({ bio: item.bio ?? "", skills: item.skills.join(", "), experienceYears: String(item.experienceYears), pricePerHour: String(item.pricePerHour), location: item.location ?? "", timezone: item.timezone || "Asia/Dhaka" });
      setAvailability((item.availability ?? []).map((slot) => ({ dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, isAvailable: slot.isAvailable })));
    }
    if (bookingResult.status === "fulfilled") setBookings(bookingResult.value.data);
    if (serviceResult.status === "fulfilled") setServices(serviceResult.value.data);
    if (categoryResult.status === "fulfilled") setCategories(categoryResult.value.data);
    setLoading(false);
  }, [user.id, user.technicianProfile?.id]);

  useEffect(() => { void load(); }, [load]);

  const stats = useMemo(() => ({
    services: services.filter((service) => service.isActive).length,
    pending: bookings.filter((booking) => booking.status === "REQUESTED").length,
    active: bookings.filter((booking) => ["ACCEPTED", "PAID", "IN_PROGRESS"].includes(booking.status)).length,
    completed: bookings.filter((booking) => booking.status === "COMPLETED").length
  }), [services, bookings]);

  async function updateStatus(booking: Booking, status: BookingStatus) {
    if (!window.confirm(`${status === "DECLINED" ? "Decline" : status === "COMPLETED" ? "Complete" : status === "IN_PROGRESS" ? "Start" : "Accept"} this booking?`)) return;
    setWorkingId(booking.id);
    try {
      const response = await api.patch<Booking>(`/technician/bookings/${booking.id}`, { status });
      toast.success(response.message);
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
    setWorkingId(serviceModal.id ?? "new-service");
    const basePayload = {
      title: serviceModal.title,
      description: serviceModal.description,
      price: Number(serviceModal.price),
      categoryId: serviceModal.categoryId
    };
    const payload = serviceModal.id
      ? { ...basePayload, location: serviceModal.location || null, isActive: serviceModal.isActive }
      : { ...basePayload, ...(serviceModal.location ? { location: serviceModal.location } : {}) };
    try {
      const response = serviceModal.id ? await api.patch<Service>(`/services/${serviceModal.id}`, payload) : await api.post<Service>("/services", payload);
      toast.success(response.message);
      setServiceModal(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  async function archiveService(service: Service) {
    if (!window.confirm(`Remove “${service.title}” from public listings?`)) return;
    setWorkingId(service.id);
    try {
      const response = await api.delete<Service>(`/services/${service.id}`);
      toast.success(response.message);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setWorkingId("profile");
    try {
      const response = await api.put<TechnicianProfile>("/technician/profile", {
        bio: profileForm.bio || null,
        skills: profileForm.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
        experienceYears: Number(profileForm.experienceYears),
        pricePerHour: Number(profileForm.pricePerHour),
        location: profileForm.location || null,
        timezone: profileForm.timezone
      });
      setProfile(response.data);
      onUserUpdated({ ...user, location: response.data.location, technicianProfile: response.data });
      toast.success(response.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  function addSlot() {
    setAvailability((current) => [...current, { dayOfWeek: "SATURDAY", startTime: "09:00", endTime: "17:00", isAvailable: true }]);
  }

  async function saveAvailability() {
    setWorkingId("availability");
    try {
      const response = await api.put<Availability[]>("/technician/availability", { slots: availability });
      setAvailability(response.data.map((slot) => ({ dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, isAvailable: slot.isAvailable })));
      toast.success(response.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  if (loading) return <div className="dashboard-loading"><Loading label="Loading technician workspace" /></div>;

  if (activeTab === "overview") {
    const nextJobs = bookings.filter((booking) => ["REQUESTED", "ACCEPTED", "PAID", "IN_PROGRESS"].includes(booking.status)).slice(0, 5);
    return <div className="dashboard-section"><div className="dashboard-heading"><div><span className="eyebrow muted-eyebrow">Technician workspace</span><h1>Good day, {user.name.split(" ")[0]}</h1><p>Manage listings, respond to assigned bookings, and keep your availability accurate.</p></div><button type="button" className="button button-primary" onClick={() => setServiceModal({ ...emptyService, categoryId: categories[0]?.id ?? "" })}><Plus size={17} /> Add service</button></div><div className="stats-grid"><article><span className="stat-icon"><Wrench /></span><small>Active services</small><strong>{stats.services}</strong><span>Public listings</span></article><article><span className="stat-icon"><Clock3 /></span><small>New requests</small><strong>{stats.pending}</strong><span>Awaiting your response</span></article><article><span className="stat-icon"><CalendarCheck2 /></span><small>Active jobs</small><strong>{stats.active}</strong><span>Accepted, paid, or started</span></article><article><span className="stat-icon"><BadgeCheck /></span><small>Completed</small><strong>{stats.completed}</strong><span>Finished jobs</span></article></div><div className="panel-card"><div className="panel-heading"><div><h2>Jobs requiring attention</h2><p>Only valid next-state actions are shown.</p></div></div>{nextJobs.length ? <div className="booking-list">{nextJobs.map((booking) => <TechnicianBookingRow key={booking.id} booking={booking} busy={workingId === booking.id} onAction={(status) => updateStatus(booking, status)} />)}</div> : <EmptyState title="No active jobs" description="New customer requests will appear here." />}</div><div className="dashboard-security-banner"><ShieldCheck size={23} /><span><strong>Workflow protection</strong><small>You can accept or decline requested jobs, start only paid jobs, and complete only in-progress jobs.</small></span></div>{serviceModal && <ServiceModal form={serviceModal} categories={categories} busy={workingId === (serviceModal.id ?? "new-service")} setForm={setServiceModal} onClose={() => setServiceModal(null)} onSubmit={saveService} />}</div>;
  }

  if (activeTab === "bookings") return <div className="dashboard-section"><div className="dashboard-heading"><div><span className="eyebrow muted-eyebrow">Assigned work</span><h1>Bookings and jobs</h1><p>Customer details are visible only for bookings assigned to your technician profile.</p></div></div>{bookings.length ? <div className="booking-list panel-card">{bookings.map((booking) => <TechnicianBookingRow key={booking.id} booking={booking} busy={workingId === booking.id} onAction={(status) => updateStatus(booking, status)} />)}</div> : <EmptyState title="No assigned bookings" description="Your first customer request will appear here." />}</div>;

  if (activeTab === "services") return <div className="dashboard-section"><div className="dashboard-heading"><div><span className="eyebrow muted-eyebrow">Service catalog</span><h1>My services</h1><p>Create, update, activate, or remove only your own service listings.</p></div><button type="button" className="button button-primary" onClick={() => setServiceModal({ ...emptyService, categoryId: categories[0]?.id ?? "" })}><Plus size={17} /> Add service</button></div>{services.length ? <div className="management-grid">{services.map((service) => <article className={`management-card ${!service.isActive ? "inactive-card" : ""}`} key={service.id}><div className="management-card-head"><span className="service-icon small-service-icon">{service.category.name.charAt(0)}</span><StatusBadge status={service.isActive ? "ACTIVE" : "BLOCKED"} /></div><span className="category-pill">{service.category.name}</span><h3>{service.title}</h3><p>{service.description}</p><div className="management-meta"><span><strong>{money(service.price)}</strong><small>Service price</small></span><span><strong>{service.location || "Profile location"}</strong><small>Service area</small></span></div><div className="management-actions"><button type="button" className="button button-secondary button-small" onClick={() => setServiceModal({ id: service.id, title: service.title, description: service.description, price: String(service.price), location: service.location ?? "", categoryId: service.categoryId, isActive: service.isActive })}><Edit3 size={15} /> Edit</button>{service.isActive && <button type="button" className="button button-ghost button-small danger-text" disabled={workingId === service.id} onClick={() => archiveService(service)}><Trash2 size={15} /> Remove</button>}</div></article>)}</div> : <EmptyState title="No service listings" description="Create a listing so customers can discover and book your work." action={<button type="button" className="button button-primary" onClick={() => setServiceModal({ ...emptyService, categoryId: categories[0]?.id ?? "" })}>Create service</button>} />}{serviceModal && <ServiceModal form={serviceModal} categories={categories} busy={workingId === (serviceModal.id ?? "new-service")} setForm={setServiceModal} onClose={() => setServiceModal(null)} onSubmit={saveService} />}</div>;

  return <div className="dashboard-section"><div className="dashboard-heading"><div><span className="eyebrow muted-eyebrow">Schedule and profile</span><h1>Availability</h1><p>Replace your weekly slots. Overlapping times and invalid ranges are rejected by the backend.</p></div><button type="button" className="button button-secondary" onClick={addSlot}><Plus size={17} /> Add time slot</button></div><div className="availability-editor panel-card"><div className="availability-editor-head"><h2>Weekly time slots</h2><span>{profile?.timezone || "Asia/Dhaka"} timezone</span></div>{availability.length ? <div className="slot-list">{availability.map((slot, index) => <div className="slot-row" key={`${slot.dayOfWeek}-${index}`}><select value={slot.dayOfWeek} onChange={(event) => setAvailability((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, dayOfWeek: event.target.value as DayOfWeek } : item))}>{DAYS.map((day) => <option value={day} key={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</option>)}</select><input type="time" value={slot.startTime} onChange={(event) => setAvailability((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, startTime: event.target.value } : item))} /><span>to</span><input type="time" value={slot.endTime} onChange={(event) => setAvailability((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, endTime: event.target.value } : item))} /><button type="button" className="icon-button danger-text" onClick={() => setAvailability((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 size={17} /></button></div>)}</div> : <EmptyState title="No availability slots" description="Customers cannot create bookings until at least one valid weekly slot is saved." />}<div className="panel-actions"><button type="button" className="button button-primary" disabled={workingId === "availability"} onClick={saveAvailability}><Save size={17} /> {workingId === "availability" ? "Saving…" : "Save all slots"}</button></div></div><form className="panel-card technician-profile-form" onSubmit={saveProfile}><div className="panel-heading"><div><h2>Professional profile</h2><p>This information appears on your public technician page.</p></div></div><label className="field"><span>Professional bio</span><textarea rows={5} maxLength={3000} value={profileForm.bio} onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })} placeholder="Describe your experience and approach…" /></label><label className="field"><span>Skills <small>(comma-separated)</small></span><input value={profileForm.skills} onChange={(event) => setProfileForm({ ...profileForm, skills: event.target.value })} placeholder="Plumbing, Pipe repair, Installation" /></label><div className="field-row"><label className="field"><span>Experience years</span><input type="number" min="0" max="80" value={profileForm.experienceYears} onChange={(event) => setProfileForm({ ...profileForm, experienceYears: event.target.value })} /></label><label className="field"><span>Hourly price</span><input type="number" min="0" step="0.01" value={profileForm.pricePerHour} onChange={(event) => setProfileForm({ ...profileForm, pricePerHour: event.target.value })} /></label></div><div className="field-row"><label className="field"><span>Location</span><div className="input-icon"><MapPin size={17} /><input value={profileForm.location} onChange={(event) => setProfileForm({ ...profileForm, location: event.target.value })} /></div></label><label className="field"><span>Timezone</span><input required minLength={3} maxLength={80} value={profileForm.timezone} onChange={(event) => setProfileForm({ ...profileForm, timezone: event.target.value })} /></label></div><button className="button button-primary" type="submit" disabled={workingId === "profile"}><Save size={17} /> {workingId === "profile" ? "Saving…" : "Save professional profile"}</button></form></div>;
}

function TechnicianBookingRow({ booking, busy, onAction }: { booking: Booking; busy: boolean; onAction: (status: BookingStatus) => void }) {
  const actions = nextActions[booking.status] ?? [];
  return <article className="booking-row technician-booking-row"><div className="booking-date"><strong>{new Date(booking.scheduledAt).toLocaleDateString("en-BD", { day: "2-digit", timeZone: "Asia/Dhaka" })}</strong><small>{new Date(booking.scheduledAt).toLocaleDateString("en-BD", { month: "short", timeZone: "Asia/Dhaka" })}</small></div><div className="booking-info"><span className="category-pill">{booking.service.category.name}</span><h3>{booking.service.title}</h3><p>{booking.customer.name} · {booking.customer.phone || booking.customer.email}</p><small>{formatDate(booking.scheduledAt)} · {booking.address}</small></div><div className="booking-amount"><strong>{money(booking.totalAmount)}</strong><StatusBadge status={booking.status} /></div><div className="booking-actions">{actions.map((action) => <button key={action.status} type="button" className={`button button-small ${action.tone === "primary" ? "button-primary" : "button-ghost danger-text"}`} disabled={busy} onClick={() => onAction(action.status)}>{action.status === "ACCEPTED" || action.status === "COMPLETED" ? <Check size={15} /> : action.status === "DECLINED" ? <X size={15} /> : <BriefcaseBusiness size={15} />} {busy ? "Working…" : action.label}</button>)}</div></article>;
}

function ServiceModal({ form, categories, busy, setForm, onClose, onSubmit }: { form: ServiceForm; categories: Category[]; busy: boolean; setForm: (form: ServiceForm | null) => void; onClose: () => void; onSubmit: (event: FormEvent) => void }) {
  return <div className="modal-backdrop" role="presentation"><div className="modal" role="dialog" aria-modal="true"><div className="modal-head"><div><span className="eyebrow muted-eyebrow">Technician listing</span><h2>{form.id ? "Edit service" : "Create service"}</h2></div><button type="button" className="icon-button" onClick={onClose}>×</button></div><form onSubmit={onSubmit}><label className="field"><span>Service title</span><input required minLength={3} maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label><label className="field"><span>Description</span><textarea required minLength={10} maxLength={3000} rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><div className="field-row"><label className="field"><span>Price</span><input required type="number" min="0.01" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><label className="field"><span>Category</span><select required value={form.categoryId} onChange={(event) => setForm({ ...form, categoryId: event.target.value })}><option value="">Select category</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label></div><label className="field"><span>Service location <small>(optional)</small></span><input minLength={2} maxLength={180} value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Uses profile location when empty" /></label>{form.id && <label className="toggle-field"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} /><span><strong>Active listing</strong><small>Inactive services are hidden from public search.</small></span></label>}<div className="modal-actions"><button type="button" className="button button-ghost" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={busy}>{busy ? "Saving…" : form.id ? "Save changes" : "Create service"}</button></div></form></div></div>;
}
