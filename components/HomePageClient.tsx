"use client";

import { CardSkeleton } from "@/components/Loading";
import { ServiceCard } from "@/components/ServiceCard";
import { TechnicianCard } from "@/components/TechnicianCard";
import { api } from "@/lib/api-client";
import { CERTIFIED_EDUCATION_ADVISORS, sanitizeAdvisor } from "@/lib/education-advisors";
import type { Category, Service, TechnicianProfile } from "@/lib/types";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Briefcase,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  Compass,
  FileCheck2,
  Globe2,
  GraduationCap,
  Headphones,
  Home,
  Layers,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Zap
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

const fallbackCategories: Category[] = [
  { id: "1", name: "Computer Science & AI", description: "Top global tech programs & data science degrees", createdAt: "", updatedAt: "" },
  { id: "2", name: "Business & Management", description: "MBA, finance, and international business degrees", createdAt: "", updatedAt: "" },
  { id: "3", name: "Engineering & Robotics", description: "Mechanical, civil, biomedical, and electrical engineering", createdAt: "", updatedAt: "" },
  { id: "4", name: "Health & Medical Sciences", description: "Medicine, public health, pharmacy, and nursing", createdAt: "", updatedAt: "" },
  { id: "5", name: "Data Science & Analytics", description: "Big data, machine learning, and business intelligence", createdAt: "", updatedAt: "" },
  { id: "6", name: "Law & Global Affairs", description: "International law, diplomacy, and public policy", createdAt: "", updatedAt: "" }
];

const fallbackServices: Service[] = [
  {
    id: "prog-1",
    title: "MSc in Computer Science & AI Admissions Package",
    description: "Full end-to-end admission guidance, university shortlisting across UK & USA, SOP review, and scholarship strategy.",
    price: 350,
    location: "United Kingdom / USA",
    isActive: true,
    categoryId: "1",
    technicianId: "tech-1",
    createdAt: "",
    updatedAt: "",
    category: { id: "1", name: "Computer Science & AI", description: null, createdAt: "", updatedAt: "" },
    technician: {
      id: "tech-1",
      userId: "u-1",
      bio: "Former Russell Group admissions committee member with 8+ years experience placing 250+ students in top UK & US tech programs.",
      skills: ["UK Admissions", "US Applications", "SOP Review", "Scholarships"],
      experienceYears: 8,
      pricePerHour: 75,
      location: "London, United Kingdom",
      timezone: "Europe/London",
      rating: 4.95,
      totalReviews: 86,
      createdAt: "",
      updatedAt: "",
      user: { id: "u-1", name: "Dr. Alistair Vance", email: "alistair@nexted.app", phone: "+44 20 7946 0912", location: "London, UK", role: "TECHNICIAN", activeStatus: "ACTIVE", createdAt: "", updatedAt: "" }
    }
  },
  {
    id: "prog-2",
    title: "Global MBA & Business School FastTrack",
    description: "Targeted admissions strategy for prestigious European and North American business schools with GMAT/GRE advisory.",
    price: 450,
    location: "Canada / Europe",
    isActive: true,
    categoryId: "2",
    technicianId: "tech-2",
    createdAt: "",
    updatedAt: "",
    category: { id: "2", name: "Business & Management", description: null, createdAt: "", updatedAt: "" },
    technician: {
      id: "tech-2",
      userId: "u-2",
      bio: "Senior International Education Advisor specialized in Canadian & European Master programs with 99% visa success rate.",
      skills: ["MBA Applications", "Canada SDS", "Visa Filing", "Interview Prep"],
      experienceYears: 10,
      pricePerHour: 90,
      location: "Toronto, Canada",
      timezone: "America/Toronto",
      rating: 4.98,
      totalReviews: 120,
      createdAt: "",
      updatedAt: "",
      user: { id: "u-2", name: "Elena Rostova", email: "elena@nexted.app", phone: "+1 416 555 0194", location: "Toronto, Canada", role: "TECHNICIAN", activeStatus: "ACTIVE", createdAt: "", updatedAt: "" }
    }
  },
  {
    id: "prog-3",
    title: "Australia & New Zealand STEM Master’s & Visa Support",
    description: "Group of Eight (Go8) university matching, fast-tracked offer letters, and comprehensive post-study work visa planning.",
    price: 300,
    location: "Australia / New Zealand",
    isActive: true,
    categoryId: "3",
    technicianId: "tech-3",
    createdAt: "",
    updatedAt: "",
    category: { id: "3", name: "Engineering & Robotics", description: null, createdAt: "", updatedAt: "" },
    technician: {
      id: "tech-3",
      userId: "u-3",
      bio: "Australian Education Specialist certified by QEAC with over a decade of student placements in Melbourne & Sydney.",
      skills: ["Australia Go8", "GTE / GS Statement", "Visa 500", "Post-Arrival"],
      experienceYears: 11,
      pricePerHour: 70,
      location: "Sydney, Australia",
      timezone: "Australia/Sydney",
      rating: 4.92,
      totalReviews: 94,
      createdAt: "",
      updatedAt: "",
      user: { id: "u-3", name: "Marcus Thorne", email: "marcus@nexted.app", phone: "+61 2 9385 1000", location: "Sydney, Australia", role: "TECHNICIAN", activeStatus: "ACTIVE", createdAt: "", updatedAt: "" }
    }
  }
];

const fallbackTechnicians: TechnicianProfile[] = [
  {
    id: "tech-1",
    userId: "u-1",
    bio: "Former Russell Group admissions committee member with 8+ years experience placing 250+ students in top UK & US tech programs.",
    skills: ["UK Admissions", "US Applications", "SOP Review", "Scholarships"],
    experienceYears: 8,
    pricePerHour: 75,
    location: "London, UK",
    timezone: "Europe/London",
    rating: 4.95,
    totalReviews: 86,
    createdAt: "",
    updatedAt: "",
    user: { id: "u-1", name: "Dr. Alistair Vance", email: "alistair@nexted.app", phone: "+44 20 7946 0912", location: "London, UK", role: "TECHNICIAN", activeStatus: "ACTIVE", createdAt: "", updatedAt: "" }
  },
  {
    id: "tech-2",
    userId: "u-2",
    bio: "Senior International Education Advisor specialized in Canadian & European Master programs with 99% visa success rate.",
    skills: ["MBA Applications", "Canada SDS", "Visa Filing", "Interview Prep"],
    experienceYears: 10,
    pricePerHour: 90,
    location: "Toronto, Canada",
    timezone: "America/Toronto",
    rating: 4.98,
    totalReviews: 120,
    createdAt: "",
    updatedAt: "",
    user: { id: "u-2", name: "Elena Rostova", email: "elena@nexted.app", phone: "+1 416 555 0194", location: "Toronto, Canada", role: "TECHNICIAN", activeStatus: "ACTIVE", createdAt: "", updatedAt: "" }
  },
  {
    id: "tech-3",
    userId: "u-3",
    bio: "Australian Education Specialist certified by QEAC with over a decade of student placements in Melbourne & Sydney.",
    skills: ["Australia Go8", "GTE / GS Statement", "Visa 500", "Post-Arrival"],
    experienceYears: 11,
    pricePerHour: 70,
    location: "Sydney, Australia",
    timezone: "Australia/Sydney",
    rating: 4.92,
    totalReviews: 94,
    createdAt: "",
    updatedAt: "",
    user: { id: "u-3", name: "Marcus Thorne", email: "marcus@nexted.app", phone: "+61 2 9385 1000", location: "Sydney, Australia", role: "TECHNICIAN", activeStatus: "ACTIVE", createdAt: "", updatedAt: "" }
  }
];

const destinations = [
  { country: "United Kingdom", flag: "🇬🇧", count: "140+ Universities" },
  { country: "Australia", flag: "🇦🇺", count: "42+ Universities" },
  { country: "USA", flag: "🇺🇸", count: "350+ Universities" },
  { country: "Canada", flag: "🇨🇦", count: "90+ Universities" },
  { country: "New Zealand", flag: "🇳🇿", count: "8 Top Universities" },
  { country: "Ireland", flag: "🇮🇪", count: "25+ Institutions" },
  { country: "Sweden", flag: "🇸🇪", count: "Top Scandi Programs" },
  { country: "Denmark", flag: "🇩🇰", count: "English-Taught Degrees" },
  { country: "Finland", flag: "🇫🇮", count: "World #1 Education" },
  { country: "Malaysia", flag: "🇲🇾", count: "Affordable Global Hub" },
  { country: "South Korea", flag: "🇰🇷", count: "Leading Tech Degrees" },
  { country: "Cyprus", flag: "🇨🇾", count: "European Transfer Pathway" },
  { country: "Germany", flag: "🇩🇪", count: "Tuition-Free Universities" },
  { country: "Japan", flag: "🇯🇵", count: "Top Asian Tech" },
  { country: "Singapore", flag: "🇸🇬", count: "Global Top 20 Ranking" }
];

export function HomePageClient() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [technicians, setTechnicians] = useState<TechnicianProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiActivePrompt, setAiActivePrompt] = useState<string>("Which UK universities offer scholarships for January intake?");

  useEffect(() => {
    Promise.allSettled([
      api.get<Service[]>("/services?limit=6&sortBy=rating&sortOrder=desc"),
      api.get<TechnicianProfile[]>("/technicians?limit=6&sortBy=rating&sortOrder=desc"),
      api.get<Category[]>("/categories")
    ]).then(([serviceResult, techResult, categoryResult]) => {
      if (serviceResult.status === "fulfilled" && serviceResult.value.data.length > 0) {
        setServices(serviceResult.value.data);
      } else {
        setServices(fallbackServices);
      }

      if (techResult.status === "fulfilled" && techResult.value.data.length > 0) {
        const sanitized = techResult.value.data.map(sanitizeAdvisor);
        const existingIds = new Set(sanitized.map((t) => t.id));
        const extra = CERTIFIED_EDUCATION_ADVISORS.filter((a) => !existingIds.has(a.id));
        setTechnicians([...sanitized, ...extra]);
      } else {
        setTechnicians(CERTIFIED_EDUCATION_ADVISORS);
      }

      if (categoryResult.status === "fulfilled" && categoryResult.value.data.length > 0) {
        setCategories(categoryResult.value.data);
      } else {
        setCategories(fallbackCategories);
      }
      setLoading(false);
    });
  }, []);

  function submitSearch(event: FormEvent) {
    event.preventDefault();
    const value = search.trim();
    router.push(value ? `/services?search=${encodeURIComponent(value)}` : "/services");
  }

  const displayedCategories = categories.length > 0 ? categories.slice(0, 6) : fallbackCategories;
  const displayedServices = services.length > 0 ? services.slice(0, 3) : fallbackServices;
  const displayedTechnicians = technicians.length > 0 ? technicians.slice(0, 3) : fallbackTechnicians;

  return (
    <>
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-glow hero-glow-one" aria-hidden="true" />
        <div className="hero-glow hero-glow-two" aria-hidden="true" />

        <div className="container hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">
              <Sparkles size={16} /> The Future of Study Abroad. Revolutionized with AI.
            </span>
            <h1>
              Study Abroad. <em>Revolutionized</em> with AI.
            </h1>
            <p>
              NextED is the world’s first AI-powered platform that does it all. Course matching, university applications, live tracking, and post-arrival support. Faster, smarter & cleaner.
            </p>

            <div className="hero-cta-group">
              <Link href="#ai-counsellor" className="button button-magenta button-large">
                <Bot size={18} /> TALK TO THE AI COUNSELLOR
              </Link>
              <Link href="/services" className="button button-secondary button-large">
                FIND MY PERFECT COURSE <ArrowRight size={18} />
              </Link>
            </div>

            <form className="hero-search" onSubmit={submitSearch}>
              <Search size={20} aria-hidden="true" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search degree, major, or country (e.g. AI Master's in UK)"
                aria-label="Search study abroad programs"
                maxLength={100}
              />
              <button type="submit" className="button button-primary">
                LET AI FIND MY MATCH
              </button>
            </form>

            <div className="hero-proof">
              <span>
                <Sparkles size={17} /> Start in 2 minutes
              </span>
              <span>
                <Users size={17} /> AI + Human team ready
              </span>
              <span>
                <CheckCircle2 size={17} /> 98% Visa success rate
              </span>
            </div>
          </div>

          <div className="hero-visual" aria-label="NextED AI Match Visual">
            <div className="hero-card-main">
              <div className="hero-card-header">
                <span className="hero-service-icon" aria-hidden="true">
                  <GraduationCap size={26} />
                </span>
                <span>
                  <small>AI Match Engine</small>
                  <strong>MSc Artificial Intelligence</strong>
                </span>
                <span className="live-dot">99% Match</span>
              </div>

              <div className="hero-person">
                <span className="avatar xlarge">US</span>
                <span>
                  <strong>University of Southampton</strong>
                  <small>
                    <Star size={14} fill="currentColor" /> World Top 100 · UK Russell Group
                  </small>
                </span>
              </div>

              <div className="hero-mini-grid">
                <span>
                  <small>Intake</small>
                  <strong>Sept 2026 / Jan 2027</strong>
                </span>
                <span>
                  <small>Tuition & Scholarship</small>
                  <strong>£3,000 Award Eligible</strong>
                </span>
              </div>

              <div className="secure-payment">
                <Bot size={20} />
                <span>
                  <strong>24/7 AI Counsellor Verified</strong>
                  <small>Your GPA, English scores, and SOP match direct university admission criteria.</small>
                </span>
              </div>
            </div>

            <div className="floating-card floating-one">
              <CheckCircle2 size={20} />
              <span>
                <strong>100% Accuracy</strong>
                <small>AI-verified submissions</small>
              </span>
            </div>

            <div className="floating-card floating-two">
              <Globe2 size={20} />
              <span>
                <strong>15 Global Destinations</strong>
                <small>UK, USA, Canada, Australia</small>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. AI Counsellor Spotlight */}
      <section className="ai-spotlight-section" id="ai-counsellor">
        <div className="container ai-spotlight-grid">
          <div className="ai-spotlight-copy">
            <span className="eyebrow light-eyebrow">
              <Bot size={16} /> 24/7 AI Counsellor
            </span>
            <h2>
              Agents are old news. <em>Welcome to the era of AI.</em>
            </h2>
            <p>
              Why chase people for updates when your AI counsellor knows everything? Why rely on opinions when you can rely on data? NextED doesn’t “guide” you — it knows you. Stop waiting for the future. You’re standing in it.
            </p>
            <div className="hero-cta-group">
              <Link href="/auth/register" className="button button-cyan button-large">
                <Sparkles size={18} /> TALK TO THE AI COUNSELLOR
              </Link>
              <Link href="/services" className="button button-ghost" style={{ color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}>
                Browse 100+ Partner Programs
              </Link>
            </div>
          </div>

          <div className="ai-interactive-widget">
            <div className="ai-widget-header">
              <span className="ai-widget-title">
                <Bot size={20} className="text-cyan-400" /> nextED Intelligent Brain
              </span>
              <span className="ai-status-pill">
                <Zap size={13} /> Active 24/7
              </span>
            </div>

            <div className="ai-chat-messages">
              <div className="ai-msg ai-msg-user">
                {aiActivePrompt}
              </div>
              <div className="ai-msg ai-msg-bot">
                ✨ <strong>NextED AI:</strong> Based on your academic profile, 14 universities in the UK (including Birmingham, Sheffield, and Queen Mary) offer automatic £2,000–£5,000 merit scholarships for your intake. Would you like me to generate your personalized document checklist?
              </div>
            </div>

            <div className="ai-quick-prompts">
              <button
                type="button"
                className="ai-prompt-btn"
                onClick={() => setAiActivePrompt("What IELTS score do I need for Australian Masters?")}
              >
                🇦🇺 IELTS for Australia
              </button>
              <button
                type="button"
                className="ai-prompt-btn"
                onClick={() => setAiActivePrompt("Can I get post-study work visa in Canada?")}
              >
                🇨🇦 Canada PGWP Rules
              </button>
              <button
                type="button"
                className="ai-prompt-btn"
                onClick={() => setAiActivePrompt("Which countries offer tuition-free English Master's?")}
              >
                🇩🇪 Scandi & German Programs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. 4-Step Journey */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-heading centered">
            <span className="eyebrow muted-eyebrow">Smart. Fast. Borderless.</span>
            <h2>Study abroad has never looked this easy — or this damn cool.</h2>
            <p>
              An intelligent, end-to-end ecosystem engineered to take you from initial idea to landing at your dream university without delays or paperwork hassles.
            </p>
          </div>

          <div className="steps-grid">
            <article>
              <span className="step-icon">
                <FileCheck2 size={26} />
              </span>
              <span className="step-number">01</span>
              <h3>1. Tell Us Who You Are</h3>
              <p>Drop your info once. Academic history, test scores, target destination. That’s it.</p>
            </article>

            <article>
              <span className="step-icon">
                <Bot size={26} />
              </span>
              <span className="step-number">02</span>
              <h3>2. AI Finds Your Matches</h3>
              <p>Thousands of global programs scanned in seconds. Filter by budget, intake, and visa ease.</p>
            </article>

            <article>
              <span className="step-icon">
                <Zap size={26} />
              </span>
              <span className="step-number">03</span>
              <h3>3. Apply Instantly</h3>
              <p>No agents. No delays. No nonsense. AI verifies your SOP and portfolio for 100% accuracy.</p>
            </article>

            <article>
              <span className="step-icon">
                <Plane size={26} />
              </span>
              <span className="step-number">04</span>
              <h3>4. Land. Live. Thrive.</h3>
              <p>We handle airport pickup, student housing, and even help find your first part-time job.</p>
            </article>
          </div>
        </div>
      </section>

      {/* 4. 8 Ecosystem Pillars */}
      <section className="section section-tinted">
        <div className="container">
          <div className="section-heading centered">
            <span className="eyebrow muted-eyebrow">Power. Precision. Perfection.</span>
            <h2>An entire ecosystem of intelligent tools, designed to make your journey effortless.</h2>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <div className="pillar-icon">
                <Compass size={22} />
              </div>
              <h3>AI Course Matching</h3>
              <p>Data-driven recommendations tailored to your unique academic and career goals.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">
                <Bot size={22} />
              </div>
              <h3>24/7 AI Counsellor</h3>
              <p>Instant, intelligent answers to all your university and visa questions, anytime.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">
                <Zap size={22} />
              </div>
              <h3>Fastest Processing</h3>
              <p>AI-optimized workflows mean your applications get submitted in record time.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">
                <Layers size={22} />
              </div>
              <h3>Live Application Tracking</h3>
              <p>A transparent, real-time view of your application status from start to finish.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">
                <Globe2 size={22} />
              </div>
              <h3>15 Global Destinations</h3>
              <p>Access top universities across the UK, USA, Canada, Australia, and more.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">
                <Headphones size={22} />
              </div>
              <h3>Human Support</h3>
              <p>Our expert team of advisors is always on standby to complement our AI platform.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">
                <Home size={22} />
              </div>
              <h3>Post-Arrival Support</h3>
              <p>We handle airport pickup, accommodation, and even help find you a part-time job.</p>
            </div>

            <div className="pillar-card">
              <div className="pillar-icon">
                <BadgeCheck size={22} />
              </div>
              <h3>100% Accuracy</h3>
              <p>AI-verified applications eliminate errors, ensuring your submissions are perfect.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 15 Global Destinations */}
      <section className="destinations-section" id="destinations">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow muted-eyebrow">Explore 15 Countries. One Intelligent Brain.</span>
              <h2>NextED connects you to universities worldwide</h2>
              <p>Powered by AI that understands where you’ll thrive academically and professionally.</p>
            </div>
            <Link href="/services" className="button button-primary">
              Explore All Courses <ArrowRight size={17} />
            </Link>
          </div>

          <div className="destinations-grid">
            {destinations.map((dest) => (
              <Link
                key={dest.country}
                href={`/services?search=${encodeURIComponent(dest.country)}`}
                className="destination-card"
              >
                <span className="destination-flag">{dest.flag}</span>
                <span className="destination-info">
                  <strong>{dest.country}</strong>
                  <small>
                    Explore courses <ArrowRight size={13} />
                  </small>
                </span>
              </Link>
            ))}
          </div>

          {/* Post-Arrival Support Banner: "You Land. We Handle." */}
          <div className="post-arrival-banner">
            <div className="post-arrival-copy">
              <span className="eyebrow light-eyebrow">
                <Plane size={16} /> Post-Arrival Guarantee
              </span>
              <h2>You Land. We Handle.</h2>
              <p>
                You focus on your future — we handle the planet around you. From the moment your flight touches down, the NextED ecosystem ensures a seamless transition into your new life abroad.
              </p>
              <Link href="/auth/register" className="button button-cyan">
                EXPERIENCE THE NEXTED DIFFERENCE <ArrowRight size={17} />
              </Link>
            </div>

            <div className="post-arrival-items">
              <div className="post-arrival-item">
                <CheckCircle2 size={20} />
                <span>Airport pickup? Done.</span>
              </div>
              <div className="post-arrival-item">
                <CheckCircle2 size={20} />
                <span>Accommodation? Sorted.</span>
              </div>
              <div className="post-arrival-item">
                <CheckCircle2 size={20} />
                <span>Part-time job guidance? Handled.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Popular Study Disciplines */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow muted-eyebrow">Academic Disciplines</span>
              <h2>Find programs in high-demand fields</h2>
            </div>
            <Link href="/services" className="text-link">
              View all programs <ArrowRight size={16} />
            </Link>
          </div>

          <div className="card-grid">
            {displayedCategories.map((category) => (
              <Link
                href={`/services?categoryId=${category.id}`}
                className="service-card"
                key={category.id}
              >
                <div className="service-card-top">
                  <span className="category-pill">{category.name}</span>
                  <span className="rating">
                    <Star size={14} fill="currentColor" /> Top Rated
                  </span>
                </div>
                <div className="service-icon">
                  {category.name.charAt(0)}
                </div>
                <h3>{category.name}</h3>
                <p>{category.description || "Leading global university curriculum and research opportunities."}</p>
                <div className="card-footer">
                  <span className="price">
                    <small>Intakes Open</small>
                    Fall / Spring
                  </span>
                  <span className="round-link">
                    <ArrowRight size={18} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Recommended Programs & Consultation Packages */}
      <section className="section section-tinted">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow muted-eyebrow">Top Admission Packages</span>
              <h2>Featured university application & consulting packages</h2>
            </div>
            <Link href="/services" className="button button-secondary">
              Browse all packages <ArrowRight size={17} />
            </Link>
          </div>

          {loading ? (
            <CardSkeleton count={3} />
          ) : (
            <div className="card-grid">
              {displayedServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 8. Top Education Advisors & Consultants */}
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow muted-eyebrow">Verified Global Advisors</span>
              <h2>Meet our expert education consultants</h2>
            </div>
            <Link href="/technicians" className="text-link">
              See all advisors <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <CardSkeleton count={3} />
          ) : (
            <div className="technician-grid">
              {displayedTechnicians.map((technician) => (
                <TechnicianCard key={technician.id} technician={technician} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 9. Trust & Track Record CTA */}
      <section className="ai-spotlight-section" style={{ background: "linear-gradient(135deg, #001229 0%, #082d64 100%)" }}>
        <div className="container" style={{ textAlign: "center", position: "relative", zIndex: 2 }}>
          <span className="eyebrow light-eyebrow">
            <Building2 size={16} /> Trusted Worldwide
          </span>
          <h2 style={{ fontSize: "clamp(32px, 3.5vw, 48px)", color: "#fff", marginBottom: "18px" }}>
            This Isn’t Consultancy. It’s Evolution.
          </h2>
          <p style={{ color: "#cbd5e1", maxWidth: "680px", margin: "0 auto 36px auto", fontSize: "17px" }}>
            Thousands are stuck chasing traditional agents. You? You’ve found the upgrade. We partner with over 100 institutions worldwide, have placed 500+ students with a 98% visa success rate.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link href="/services" className="button button-magenta button-large">
              FIND MY PERFECT COURSE
            </Link>
            <Link href="/auth/register" className="button button-cyan button-large">
              TALK TO THE AI COUNSELLOR
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
