"use client";

import { useAuth } from "@/components/AuthProvider";
import { Logo } from "@/components/Logo";
import { useToast } from "@/components/ToastProvider";
import { initials, roleLabel } from "@/lib/utils";
import { LayoutDashboard, LogIn, LogOut, Menu, ShieldCheck, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/services", label: "Services" },
  { href: "/technicians", label: "Professionals" }
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    toast.success("You have been signed out securely.");
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Logo />

        <nav className={`main-nav ${open ? "is-open" : ""}`} aria-label="Primary navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname.startsWith(link.href) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/#how-it-works" onClick={() => setOpen(false)}>
            How it works
          </Link>

          <span className="mobile-nav-divider" />

          {!loading && (
            user ? (
              <>
                <Link
                  href="/dashboard"
                  className="mobile-only"
                  onClick={() => setOpen(false)}
                >
                  <LayoutDashboard size={18} /> Dashboard
                </Link>
                <button
                  type="button"
                  className="mobile-only nav-button danger-text"
                  onClick={handleLogout}
                >
                  <LogOut size={18} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="mobile-only"
                  onClick={() => setOpen(false)}
                >
                  <LogIn size={18} /> Sign in
                </Link>
                <Link
                  href="/auth/register"
                  className="mobile-only"
                  onClick={() => setOpen(false)}
                >
                  <UserPlus size={18} /> Create account
                </Link>
              </>
            )
          )}
        </nav>

        <div className="header-actions">
          <span className="secure-chip">
            <ShieldCheck size={15} /> Secure booking
          </span>

          {!loading && (
            user ? (
              <>
                <Link
                  href="/dashboard"
                  className="user-pill"
                  title={`${roleLabel(user.role)} dashboard`}
                >
                  <span className="avatar small">{initials(user.name)}</span>
                  <span>
                    <strong>{user.name.split(" ")[0]}</strong>
                    <small>{roleLabel(user.role)}</small>
                  </span>
                </Link>
                <button
                  type="button"
                  className="icon-button desktop-only"
                  onClick={handleLogout}
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="button button-ghost desktop-only">
                  Sign in
                </Link>
                <Link href="/auth/register" className="button button-primary desktop-only">
                  Get started
                </Link>
              </>
            )
          )}

          <button
            type="button"
            className="menu-button"
            aria-expanded={open}
            aria-label="Toggle navigation menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
