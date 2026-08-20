"use client";

import { CardSkeleton } from "@/components/Loading";
import { ServiceCard } from "@/components/ServiceCard";
import { TechnicianCard } from "@/components/TechnicianCard";
import { api } from "@/lib/api-client";
import type { Category, Service, TechnicianProfile } from "@/lib/types";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CreditCard,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const fallbackCategories: Category[] = [
  { id: "1", name: "Plumbing", description: "Leaks, pipes, and fixture repairs", createdAt: "", updatedAt: "" },
  { id: "2", name: "Electrical", description: "Safe wiring and electrical setup", createdAt: "", updatedAt: "" },
  { id: "3", name: "Cleaning", description: "Deep home and office cleaning", createdAt: "", updatedAt: "" },
  { id: "4", name: "Appliance", description: "Appliance repair and maintenance", createdAt: "", updatedAt: "" },
  { id: "5", name: "Painting", description: "Interior and exterior wall painting", createdAt: "", updatedAt: "" },
  { id: "6", name: "AC Service", description: "Cooling repair and regular servicing", createdAt: "", updatedAt: "" }
];

export function HomePageClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get<Service[]>("/services?limit=6&sortBy=rating&sortOrder=desc"),
      api.get<TechnicianProfile[]>("/technicians?limit=3&sortBy=rating&sortOrder=desc"),
      api.get<Category[]>("/categories")
    ]).then(([serviceResult, techResult, categoryResult]) => {
      if (serviceResult.status === "fulfilled") setServices(serviceResult.value.data);
      if (techResult.status === "fulfilled") setTechnicians(techResult.value.data);
      if (categoryResult.status === "fulfilled") setCategories(categoryResult.value.data);
      setLoading(false);
    });
  }, []);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const value = search.trim();
    router.push(value ? `/services?search=${encodeURIComponent(value)}` : "/services");
  }

  const displayedCategories = categories.length > 0 ? categories.slice(0, 6) : fallbackCategories;

  return (
    <>
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />

        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={16} /> Trusted professionals, one secure platform
            </span>
            <h1>
              Home services done <em>right</em>, right when you need them.
            </h1>
            <p>
              Discover skilled technicians, compare transparent prices, book verified availability, and pay securely with server-confirmed checkout.
            </p>

            <form className="hero-search" onSubmit={submitSearch}>
              <Search size={20} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="What service do you need today?"
                aria-label="Search home services"
                maxLength={100}
              />
              <button type="submit" className="button button-primary">
                Find a professional
              </button>
            </form>

            <div className="hero-proof">
              <span>
                <ShieldCheck size={17} /> Protected accounts
              </span>
              <span>
                <BadgeCheck size={17} /> Role-verified actions
              </span>
              <span>
                <CreditCard size={17} /> Verified payments
              </span>
            </div>
          </div>

          <div className="hero-visual" aria-label="FixItNow service overview visual">
            <div className="hero-card-main">
              <div className="hero-card-header">
                <span className="hero-service-icon" aria-hidden="true">
                  <Wrench size={24} />
                </span>
                <span>
                  <small>Live service request</small>
                  <strong>Emergency plumbing</strong>
                </span>
                <span className="live-dot">Available</span>
              </div>

              <div className="hero-person">
                <span className="avatar xlarge">AR</span>
                <span>
                  <strong>Arif Rahman</strong>
                  <small>
                    <Star size={14} fill="currentColor" /> 4.9 · Verified technician
                  </small>
                </span>
              </div>

              <div className="hero-mini-grid">
                <span>
                  <small>Arrival estimate</small>
                  <strong>Today, 4:30 PM</strong>
                </span>
                <span>
                  <small>Fixed rate</small>
                  <strong>৳1,500</strong>
                </span>
              </div>

              <div className="secure-payment">
                <ShieldCheck size={20} />
                <span>
                  <strong>Secure booking flow</strong>
                  <small>Payment status is confirmed directly with the gateway before job start.</small>
                </span>
              </div>
            </div>

            <div className="floating-card floating-one">
              <ShieldCheck size={20} />
              <span>
                <strong>100% Verified</strong>
                <small>Background-checked</small>
              </span>
            </div>

            <div className="floating-card floating-two">
              <BadgeCheck size={20} />
              <span>
                <strong>4.9 / 5.0 Rating</strong>
                <small>Trusted customer reviews</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Popular Categories */}
      <section className="category-strip">
        <div className="container">
          <div className="section-heading compact-heading">
            <div>
              <span className="eyebrow muted-eyebrow">Popular categories</span>
              <h2>Start with what your home needs</h2>
            </div>
            <Link href="/services" className="text-link">
              View all services <ArrowRight size={16} />
            </Link>
          </div>

          <div className="category-grid">
            {displayedCategories.map((category, index) => (
              <Link
                href={`/services?categoryId=${category.id}`}
                className="category-card"
                key={category.id}
              >
                <span className="category-number">0{index + 1}</span>
                <span>
                  <strong>{category.name}</strong>
                  <small>{category.description || "Professional home service"}</small>
                </span>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-heading centered">
            <span className="eyebrow muted-eyebrow">Simple and accountable</span>
            <h2>From search to solved in three easy steps</h2>
            <p>
              The platform enforces live availability, conflict checks, role-based workflows, and secure payment verification at the backend level.
            </p>
          </div>

          <div className="steps-grid">
            <article>
              <span className="step-icon">
                <Search size={26} />
              </span>
              <span className="step-number">01</span>
              <h3>Choose confidently</h3>
              <p>Filter verified services by category, location, starting price, and technician ratings.</p>
            </article>

            <article>
              <span className="step-icon">
                <CalendarCheck2 size={26} />
              </span>
              <span className="step-number">02</span>
              <h3>Book a verified slot</h3>
              <p>Requests are automatically validated against the technician’s weekly schedule and live reservations.</p>
            </article>

            <article>
              <span className="step-icon">
                <CreditCard size={26} />
              </span>
              <span className="step-number">03</span>
              <h3>Pay securely</h3>
              <p>Checkout unlocks after technician acceptance, and payment verification is checked server-side.</p>
            </article>
          </div>
        </div>
      </section>

      {/* 4. Recommended Services */}
      <section className="section section-tinted">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow muted-eyebrow">Recommended for you</span>
              <h2>Professional services near you</h2>
            </div>
            <Link href="/services" className="button button-secondary">
              Browse all services <ArrowRight size={17} />
            </Link>
          </div>

          {loading ? (
            <CardSkeleton count={3} />
          ) : services.length > 0 ? (
            <div className="card-grid">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="api-empty">
              <Wrench size={32} />
              <h3>Services will appear here</h3>
              <p>The interface is connected to the backend API and will populate as soon as active listings are published.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. Top Professionals */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow muted-eyebrow">Top professionals</span>
              <h2>Meet trusted technicians</h2>
            </div>
            <Link href="/technicians" className="text-link">
              See all professionals <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <CardSkeleton count={3} />
          ) : technicians.length > 0 ? (
            <div className="technician-grid">
              {technicians.map((technician) => (
                <TechnicianCard key={technician.id} technician={technician} />
              ))}
            </div>
          ) : (
            <div className="api-empty">
              <BadgeCheck size={32} />
              <h3>Technician profiles will appear here</h3>
              <p>Complete technician profiles and active listings in the dashboard to showcase them publicly.</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. Security By Design */}
      <section className="security-section">
        <div className="container security-grid">
          <div>
            <span className="eyebrow light-eyebrow">
              <ShieldCheck size={16} /> Security by design
            </span>
            <h2>Your browser never stores access tokens.</h2>
            <p>
              FixItNow uses a same-origin Next.js gateway, HTTP-only cookies, CSRF validation, strict content security policies, and backend-enforced role permissions.
            </p>
            <Link href="/auth/register" className="button button-light">
              Create a secure account <ArrowRight size={17} />
            </Link>
          </div>

          <div className="security-list">
            <span>
              <strong>HTTP-only session cookies</strong>
              <small>Authentication tokens are completely inaccessible to client-side JavaScript and browser extensions.</small>
            </span>
            <span>
              <strong>Role-based access control</strong>
              <small>Customer, Technician, and Admin actions are isolated and validated on every API request.</small>
            </span>
            <span>
              <strong>Server-verified payments</strong>
              <small>Browser redirects alone never mark a booking as paid; only backend gateway callbacks do.</small>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
