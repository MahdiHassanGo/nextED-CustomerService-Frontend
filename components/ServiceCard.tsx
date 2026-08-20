import type { Service } from "@/lib/types";
import { initials, money } from "@/lib/utils";
import { ArrowUpRight, MapPin, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const technician = service.technician;
  const rating = technician.rating ? Number(technician.rating).toFixed(1) : "0.0";
  const location = service.location || technician.location || "Available on request";
  const initial = service.category?.name ? service.category.name.charAt(0).toUpperCase() : "S";

  return (
    <article className="service-card">
      <div className="service-card-top">
        <span className="category-pill">{service.category?.name || "Service"}</span>
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
        <MapPin size={15} aria-hidden="true" /> {location}
      </div>

      <div className="provider-row">
        <span className="avatar small">{initials(technician.user?.name || "Tech")}</span>
        <span>
          <strong>{technician.user?.name || "Verified Technician"}</strong>
          <small>
            <ShieldCheck size={13} aria-hidden="true" /> Verified professional
          </small>
        </span>
      </div>

      <div className="card-footer">
        <span className="price">
          <small>Starting from</small>
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
