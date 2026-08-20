"use client";

import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { CustomerDashboard } from "@/components/dashboard/CustomerDashboard";
import { ProfilePanel } from "@/components/dashboard/ProfilePanel";
import { TechnicianDashboard } from "@/components/dashboard/TechnicianDashboard";
import type { PublicUser } from "@/lib/types";
import { initials, roleLabel } from "@/lib/utils";
import {
  BookOpenCheck,
  CalendarClock,
  CreditCard,
  FolderCog,
  Gauge,
  LayoutList,
  Settings,
  ShieldCheck,
  UsersRound,
  Wrench
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const roleTabs = {
  CUSTOMER: [
    { id: "overview", label: "Overview", icon: Gauge },
    { id: "bookings", label: "My bookings", icon: CalendarClock },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "profile", label: "Profile", icon: Settings }
  ],
  TECHNICIAN: [
    { id: "overview", label: "Overview", icon: Gauge },
    { id: "bookings", label: "Assigned jobs", icon: BookOpenCheck },
    { id: "services", label: "My services", icon: Wrench },
    { id: "availability", label: "Availability", icon: CalendarClock },
    { id: "profile", label: "Profile", icon: Settings }
  ],
  ADMIN: [
    { id: "overview", label: "Overview", icon: Gauge },
    { id: "users", label: "Users", icon: UsersRound },
    { id: "bookings", label: "Bookings", icon: LayoutList },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "categories", label: "Categories", icon: FolderCog },
    { id: "profile", label: "Profile", icon: Settings }
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
              <ShieldCheck size={13} /> {roleLabel(user.role)} account
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
          <ShieldCheck size={20} />
          <span>
            <strong>Protected workspace</strong>
            <small>Every action is verified by backend role policies.</small>
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
