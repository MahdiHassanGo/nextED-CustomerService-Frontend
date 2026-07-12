import type { Service } from "@/lib/types";
import { initials, money } from "@/lib/utils";
import { ArrowUpRight, MapPin, ShieldCheck, Star } from "lucide-react";
import Link from "next/link";

export function ServiceCard({ service }: { service: Service }) {
  const technician = service.technician;
  return (
    <article className="service-card">
      <div className="service-card-top">
        <span className="category-pill">{service.category.name}</span>
        <span className="rating"><Star size={15} fill="currentColor" /> {technician.rating?.toFixed(1) ?? "0.0"}</span>
      </div>
      <div className="service-icon" aria-hidden="true">{service.category.name.charAt(0).toUpperCase()}</div>
      <h3><Link href={`/services/${service.id}`}>{service.title}</Link></h3>
      <p className="line-clamp-2">{service.description}</p>
      <div className="service-location"><MapPin size={15} /> {service.location || technician.location || "Location on request"}</div>
      <div className="provider-row">
        <span className="avatar small">{initials(technician.user.name)}</span>
        <span><strong>{technician.user.name}</strong><small><ShieldCheck size={13} /> Verified professional</small></span>
      </div>
      <div className="card-footer">
        <span className="price"><small>Starting from</small>{money(service.price)}</span>
        <Link href={`/services/${service.id}`} className="round-link" aria-label={`View ${service.title}`}><ArrowUpRight size={19} /></Link>
      </div>
    </article>
  );
}
