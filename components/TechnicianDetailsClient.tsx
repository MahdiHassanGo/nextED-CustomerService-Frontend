"use client";

import { Loading } from "@/components/Loading";
import { ServiceCard } from "@/components/ServiceCard";
import { api } from "@/lib/api-client";
import type { TechnicianProfile } from "@/lib/types";
import { formatDate, initials, money } from "@/lib/utils";
import { ArrowLeft, BadgeCheck, BriefcaseBusiness, CalendarClock, MapPin, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const days = ["SATURDAY", "SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];

export function TechnicianDetailsClient({ id }: { id: string }) {
  const [technician, setTechnician] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void api.get<TechnicianProfile>(`/technicians/${id}`).then((response) => setTechnician(response.data)).catch(() => setTechnician(null)).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="detail-loading"><Loading label="Loading technician profile" /></div>;
  if (!technician || !technician.user) return <div className="container not-found-card"><BadgeCheck size={34} /><h1>Professional not found</h1><p>This profile is unavailable or inactive.</p><Link href="/technicians" className="button button-primary">Back to professionals</Link></div>;

  return (
    <div className="detail-page technician-detail-page">
      <div className="container"><Link href="/technicians" className="back-link"><ArrowLeft size={17} /> Back to professionals</Link></div>
      <section className="container profile-hero">
        <span className="avatar profile-avatar">{initials(technician.user.name)}</span>
        <div className="profile-main"><span className="verified-line"><BadgeCheck size={15} /> Active professional</span><h1>{technician.user.name}</h1><p>{technician.bio || "Reliable home-service professional committed to quality work and clear communication."}</p><div className="profile-meta"><span><MapPin size={17} /> {technician.location || technician.user.location || "Bangladesh"}</span><span><BriefcaseBusiness size={17} /> {technician.experienceYears} years experience</span><span><Star size={17} fill="currentColor" /> {technician.rating.toFixed(1)} from {technician.totalReviews} reviews</span></div><div className="tag-list profile-tags">{technician.skills.length ? technician.skills.map((skill) => <span key={skill}>{skill}</span>) : <span>General services</span>}</div></div>
        <aside className="profile-rate"><small>Hourly rate</small><strong>{money(technician.pricePerHour)}</strong><span><ShieldCheck size={15} /> Book through an active service listing</span></aside>
      </section>
      <section className="container profile-content-grid">
        <div>
          <div className="section-heading compact-heading"><div><span className="eyebrow muted-eyebrow">Available services</span><h2>Services by {technician.user.name.split(" ")[0]}</h2></div></div>
          {technician.services?.length ? <div className="card-grid two-column-grid">{technician.services.map((service) => <ServiceCard service={{ ...service, technician } as never} key={service.id} />)}</div> : <div className="api-empty"><CalendarClock size={26} /><h3>No active services</h3><p>This technician has not published an active service listing yet.</p></div>}
        </div>
        <aside className="availability-card"><h2><CalendarClock size={20} /> Weekly availability</h2><p>Times are maintained by the technician. The backend performs the final availability and conflict check.</p><div className="availability-list">{days.map((day) => { const slots = technician.availability?.filter((slot) => slot.dayOfWeek === day) ?? []; return <div key={day}><strong>{day.charAt(0) + day.slice(1).toLowerCase()}</strong><span>{slots.length ? slots.map((slot) => `${slot.startTime}–${slot.endTime}`).join(", ") : "Unavailable"}</span></div>; })}</div></aside>
      </section>
      <section className="section section-tinted"><div className="container"><div className="section-heading compact-heading"><div><span className="eyebrow muted-eyebrow">Customer feedback</span><h2>Verified booking reviews</h2></div></div>{technician.reviews?.length ? <div className="reviews-grid">{technician.reviews.map((review) => <article className="review-card" key={review.id}><div><span className="avatar small">{initials(review.customer?.name ?? "Customer")}</span><span><strong>{review.customer?.name ?? "Customer"}</strong><small>{formatDate(review.createdAt, { dateStyle: "medium", timeStyle: undefined })}</small></span><span className="rating"><Star size={14} fill="currentColor" /> {review.rating}.0</span></div><p>{review.comment || "The customer left a rating without a written comment."}</p></article>)}</div> : <div className="api-empty"><Star size={26} /><h3>No reviews yet</h3><p>Reviews can be submitted only by customers after a booking is completed.</p></div>}</div></section>
    </div>
  );
}
