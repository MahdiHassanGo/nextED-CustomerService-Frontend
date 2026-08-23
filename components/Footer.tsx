import { Logo } from "@/components/Logo";
import { Bot, CheckCircle2, Globe2, Mail, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = 2026;

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            The Future of Study Abroad. NextED is the world’s first AI-powered platform for course matching, university admissions, live tracking, and post-arrival support.
          </p>
          <div className="footer-trust">
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={16} /> 24/7 AI Counsellor
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <CheckCircle2 size={16} /> 98% Visa Success Rate
            </span>
          </div>
        </div>

        <div>
          <h3>Study Abroad</h3>
          <Link href="/services">Find My Perfect Course</Link>
          <Link href="/technicians">Talk to Advisors</Link>
          <Link href="/#ai-counsellor">24/7 AI Counsellor</Link>
          <Link href="/#destinations">Explore 15 Destinations</Link>
          <Link href="/#how-it-works">How NextED Works</Link>
        </div>

        <div>
          <h3>Student Portal</h3>
          <Link href="/auth/login">Student Sign In</Link>
          <Link href="/auth/register">Create Free Account</Link>
          <Link href="/dashboard">Application Tracker</Link>
          <Link href="/dashboard?tab=profile">Student Profile</Link>
        </div>

        <div>
          <h3>Global Office</h3>
          <p className="footer-line">
            <Globe2 size={16} /> 15 Global Destinations
          </p>
          <p className="footer-line">
            <MapPin size={16} /> UK · USA · Canada · Australia · Europe
          </p>
          <p className="footer-line">
            <Mail size={16} /> support@nexted.app
          </p>
          <div className="footer-socials">
            <a href="https://www.facebook.com/p/NextEd-Advisors-61561246423812/" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.instagram.com/nexted_advisors?igsh=MW00NHdyNTRkaHlueA==" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.linkedin.com/company/nextedapp" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://www.youtube.com/@nextedadvisors" target="_blank" rel="noopener noreferrer">YouTube</a>
          </div>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {currentYear} nextED. All rights reserved.</span>
        <span>Empowering borderless education with AI precision.</span>
      </div>
    </footer>
  );
}
