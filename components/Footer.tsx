import { Logo } from "@/components/Logo";
import { LockKeyhole, Mail, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Professional home services, transparent booking, and secure payments—built for customers and technicians across Bangladesh.</p>
          <div className="footer-trust"><ShieldCheck size={18} /> Role-protected platform <LockKeyhole size={18} /> Secure session cookies</div>
        </div>
        <div><h3>Explore</h3><Link href="/services">Browse services</Link><Link href="/technicians">Find professionals</Link><Link href="/#how-it-works">How it works</Link></div>
        <div><h3>Account</h3><Link href="/auth/login">Sign in</Link><Link href="/auth/register">Create account</Link><Link href="/dashboard">Dashboard</Link></div>
        <div><h3>Platform</h3><p className="footer-line"><MapPin size={16} /> Bangladesh</p><p className="footer-line"><Mail size={16} /> Support through your platform administrator</p><p className="footer-note">Payments are verified by the backend before a booking is marked paid.</p></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} FixItNow. All rights reserved.</span><span>Built with Next.js and secure API gateway architecture.</span></div>
    </footer>
  );
}
