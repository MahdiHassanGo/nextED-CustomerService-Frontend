import type { TechnicianProfile } from "@/lib/types";
import { initials, money } from "@/lib/utils";
import { ArrowRight, BriefcaseBusiness, MapPin, Star } from "lucide-react";
import Link from "next/link";

export function TechnicianCard({ technician }: { technician: TechnicianProfile }) {
  const name = technician.user?.name ?? "Professional";
  return (
    <article className="technician-card">
      <div className="technician-head">
        <span className="avatar large">{initials(name)}</span>
        <div className="rating-block"><Star size={16} fill="currentColor" /><strong>{technician.rating.toFixed(1)}</strong><small>{technician.totalReviews} reviews</small></div>
      </div>
      <h3><Link href={`/technicians/${technician.id}`}>{name}</Link></h3>
      <p className="technician-bio line-clamp-2">{technician.bio || "Experienced home-service professional ready to help with reliable, quality work."}</p>
      <div className="tag-list">{technician.skills.slice(0, 4).map((skill) => <span key={skill}>{skill}</span>)}{technician.skills.length === 0 && <span>General services</span>}</div>
      <div className="technician-meta"><span><MapPin size={15} /> {technician.location || technician.user?.location || "Bangladesh"}</span><span><BriefcaseBusiness size={15} /> {technician.experienceYears} years</span></div>
      <div className="card-footer"><span className="price"><small>Hourly rate</small>{money(technician.pricePerHour)}</span><Link href={`/technicians/${technician.id}`} className="text-link">View profile <ArrowRight size={16} /></Link></div>
    </article>
  );
}
