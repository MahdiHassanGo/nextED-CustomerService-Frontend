"use client";

import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";
import { ProfilePanel } from "@/components/dashboard/ProfilePanel";
import { TechnicianDashboard } from "@/components/dashboard/TechnicianDashboard";
import type { PublicUser } from "@/lib/types";
import { initials, roleLabel } from "@/lib/utils";
import {
  BookOpenCheck,
  Bot,
  CalendarClock,
  CheckCircle2,
  Compass,
  CreditCard,
  FolderCog,
  Gauge,
  GraduationCap,
  LayoutList,
  Layers,
  Settings,
  ShieldCheck,
  Sparkles,
  UsersRound
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const roleTabs = {
  CUSTOMER: [
    { id: "overview", label: "Student Overview", icon: Gauge },
    { id: "bookings", label: "My Applications", icon: Layers },
    { id: "counsellor", label: "24/7 AI Counsellor", icon: Bot },
    { id: "payments", label: "Payments & Invoices", icon: CreditCard },
    { id: "profile", label: "Student Profile", icon: Settings }
  ],
  TECHNICIAN: [
    { id: "overview", label: "Advisor Overview", icon: Gauge },
    { id: "bookings", label: "Student Queue", icon: BookOpenCheck },
    { id: "services", label: "Consultation Packages", icon: GraduationCap },
    { id: "availability", label: "Weekly Schedule", icon: CalendarClock },
    { id: "profile", label: "Advisor Profile", icon: Settings }
  ],
  ADMIN: [
    { id: "overview", label: "Agency Overview", icon: Gauge },
    { id: "users", label: "Students & Advisors", icon: UsersRound },
    { id: "bookings", label: "All Applications", icon: LayoutList },
    { id: "payments", label: "Financial Ledger", icon: CreditCard },
    { id: "categories", label: "Academic Disciplines", icon: FolderCog },
    { id: "profile", label: "Admin Profile", icon: Settings }
  ]
} as const;

export function DashboardShell({ initialUser }: { initialUser: PublicUser }) {
  const searchParams = useSearchParams();
  const tabs = useMemo(() => roleTabs[initialUser.role] || roleTabs.CUSTOMER, [initialUser.role]);
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<string>(
    tabs.some((tab) => tab.id === requestedTab) ? requestedTab! : "overview"
  );
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    if (requestedTab && tabs.some((tab) => tab.id === requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab, tabs]);

  return (
    <div className="dashboard-page">
      <aside className="dashboard-sidebar">
        <div className="dashboard-user">
          <span className="avatar large">{initials(user.name)}</span>
          <span>
            <strong>{user.name}</strong>
            <small>
              <Sparkles size={13} /> {roleLabel(user.role)} Workspace
            </small>
          </span>
        </div>

        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                type="button"
                key={tab.id}
                className={isActive ? "active" : ""}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-security">
          <Bot size={20} />
          <span>
            <strong>nextED AI + Human Engine</strong>
            <small>Direct access to university admissions & real-time tracking.</small>
          </span>
        </div>
      </aside>

      <section className="dashboard-main">
        {activeTab === "profile" ? (
          <ProfilePanel user={user} onUpdated={setUser} />
        ) : initialUser.role === "CUSTOMER" ? (
          <CustomerDashboard user={user} activeTab={activeTab} />
        ) : initialUser.role === "TECHNICIAN" ? (
          <TechnicianDashboard user={user} activeTab={activeTab} onUserUpdated={setUser} />
        ) : (
          <AdminDashboard user={user} activeTab={activeTab} />
        )}
      </section>
    </div>
  );
}
