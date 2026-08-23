import type { Service } from "@/lib/types";
import { initials, money } from "@/lib/utils";
import { ArrowUpRight, CheckCircle2, Globe2, GraduationCap, Star } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const technician = service.technician;
  const rating = technician.rating ? Number(technician.rating).toFixed(1) : "4.9";
  const location = service.location || technician.location || "Global Online / Multiple Destinations";
  const initial = service.category?.name ? service.category.name.charAt(0).toUpperCase() : "C";

  return (
    <article className="service-card">
      <div className="service-card-top">
        <span className="category-pill">{service.category?.name || "Academic Program"}</span>
        <span className="rating" title={`${rating} average rating`}>
          <Star size={14} fill="currentColor" aria-hidden="true" /> {rating}
        </span>
      </div>

      <div className="service-icon" aria-hidden="true">
        {initial}
      </div>

      <h3>
        <Link href={`/services/${service.id}`}>{service.title}</Link>
      </h3>

      <p className="line-clamp-2">{service.description}</p>

      <div className="service-location">
        <Globe2 size={15} aria-hidden="true" /> {location}
      </div>

      <div className="provider-row">
        <span className="avatar small">{initials(technician.user?.name || "Advisor")}</span>
        <span>
          <strong>{technician.user?.name || "Verified University Advisor"}</strong>
          <small>
            <CheckCircle2 size={13} aria-hidden="true" /> Licensed Education Specialist
          </small>
        </span>
      </div>

      <div className="card-footer">
        <span className="price">
          <small>Admissions Package</small>
          {money(service.price)}
        </span>
        <Link
          href={`/services/${service.id}`}
          className="round-link"
          aria-label={`View details for ${service.title}`}
          title={`View details for ${service.title}`}
        >
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  );
}
