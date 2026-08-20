import type { TechnicianProfile } from "@/lib/types";
import { initials, money } from "@/lib/utils";
import { ArrowRight, BriefcaseBusiness, MapPin, Star } from "lucide-react";
import Link from "next/link";

interface TechnicianCardProps {
  technician: TechnicianProfile;
}

export function TechnicianCard({ technician }: TechnicianCardProps) {
  const name = technician.user?.name ?? "Professional";
  const rating = Number(technician.rating || 0).toFixed(1);
  const location = technician.location || technician.user?.location || "Bangladesh";

  return (
    <article className="technician-card">
      <div className="technician-head">
        <span className="avatar large">{initials(name)}</span>
        <div className="rating-block" title={`${rating} from ${technician.totalReviews || 0} reviews`}>
          <Star size={15} fill="currentColor" aria-hidden="true" />
          <strong>{rating}</strong>
          <small>{technician.totalReviews || 0} reviews</small>
        </div>
      </div>

      <h3>
        <Link href={`/technicians/${technician.id}`}>{name}</Link>
      </h3>

      <p className="technician-bio line-clamp-2">
        {technician.bio || "Experienced home-service professional ready to help with reliable, quality work."}
      </p>

      <div className="tag-list">
        {technician.skills && technician.skills.length > 0 ? (
          technician.skills.slice(0, 4).map((skill) => (
            <span key={skill}>{skill}</span>
          ))
        ) : (
          <span>General services</span>
        )}
      </div>

      <div className="technician-meta">
        <span>
          <MapPin size={15} aria-hidden="true" /> {location}
        </span>
        <span>
          <BriefcaseBusiness size={15} aria-hidden="true" /> {technician.experienceYears || 0} years experience
        </span>
      </div>

      <div className="card-footer">
        <span className="price">
          <small>Hourly rate</small>
          {money(technician.pricePerHour)}
        </span>
        <Link href={`/technicians/${technician.id}`} className="text-link">
          View profile <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
