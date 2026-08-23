import type { TechnicianProfile } from "@/lib/types";
import { initials, money } from "@/lib/utils";
import { ArrowRight, Briefcase, CheckCircle2, Globe2, Star } from "lucide-react";
import Link from "next/link";

interface TechnicianCardProps {
  technician: TechnicianProfile;
}

export function TechnicianCard({ technician }: TechnicianCardProps) {
  const name = technician.user?.name ?? "Education Advisor";
  const rating = Number(technician.rating || 4.9).toFixed(1);
  const location = technician.location || technician.user?.location || "Global Online / UK / USA";

  return (
    <article className="technician-card">
      <div className="technician-head">
        <span className="avatar large">{initials(name)}</span>
        <div className="rating-block" title={`${rating} from ${technician.totalReviews || 0} student reviews`}>
          <Star size={15} fill="currentColor" aria-hidden="true" />
          <strong>{rating}</strong>
          <small>({technician.totalReviews || 0} reviews)</small>
        </div>
      </div>

      <h3>
        <Link href={`/technicians/${technician.id}`}>{name}</Link>
      </h3>

      <p className="technician-bio line-clamp-2">
        {technician.bio || "Certified international education consultant guiding students through course selection, scholarships, and visa filing."}
      </p>

      <div className="tag-list">
        {technician.skills && technician.skills.length > 0 ? (
          technician.skills.slice(0, 4).map((skill) => (
            <span key={skill}>{skill}</span>
          ))
        ) : (
          <span>UK & US Admissions</span>
        )}
      </div>

      <div className="technician-meta">
        <span>
          <Globe2 size={15} aria-hidden="true" /> {location}
        </span>
        <span>
          <Briefcase size={15} aria-hidden="true" /> {technician.experienceYears || 5} years advisory experience
        </span>
      </div>

      <div className="card-footer">
        <span className="price">
          <small>Advisory rate</small>
          {money(technician.pricePerHour)}/hr
        </span>
        <Link href={`/technicians/${technician.id}`} className="text-link">
          View advisor profile <ArrowRight size={16} />
        </Link>
      </div>
    </article>
  );
}
