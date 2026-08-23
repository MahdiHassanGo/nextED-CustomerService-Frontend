"use client";

import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import { sanitizeInput } from "@/lib/security";
import type { Booking, Category, Payment, PublicUser } from "@/lib/types";
import { applicationStatusLabel, formatDate, getErrorMessage, initials, money, roleLabel } from "@/lib/utils";
import {
  Ban,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  CreditCard,
  Edit3,
  FolderCog,
  Globe2,
  GraduationCap,
  Layers,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  UsersRound,
  Zap
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type CategoryForm = { id?: string; name: string; description: string };

interface AdminDashboardProps {
  user: PublicUser;
  activeTab: string;
}

export function AdminDashboard({ user, activeTab }: AdminDashboardProps) {
  const toast = useToast();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [categoryModal, setCategoryModal] = useState<CategoryForm | null>(null);
  const [userFilter, setUserFilter] = useState({ search: "", role: "", status: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const [userResult, bookingResult, paymentResult, categoryResult] = await Promise.allSettled([
      api.get<PublicUser[]>("/admin/users?limit=100"),
      api.get<Booking[]>("/admin/bookings"),
      api.get<Payment[]>("/admin/payments"),
      api.get<Category[]>("/admin/categories")
    ]);
    if (userResult.status === "fulfilled") setUsers(userResult.value.data);
    if (bookingResult.status === "fulfilled") setBookings(bookingResult.value.data);
    if (paymentResult.status === "fulfilled") setPayments(paymentResult.value.data);
    if (categoryResult.status === "fulfilled") setCategories(categoryResult.value.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const totalStudents = users.filter((u) => u.role === "CUSTOMER").length;
    const totalAdvisors = users.filter((u) => u.role === "TECHNICIAN").length;
    const totalBookings = bookings.length;
    const completedAdmissions = bookings.filter((b) => b.status === "COMPLETED").length;
    const totalRevenue = payments
      .filter((p) => p.status === "COMPLETED")
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);
    return { totalStudents, totalAdvisors, totalBookings, completedAdmissions, totalRevenue };
  }, [users, bookings, payments]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userFilter.role && u.role !== userFilter.role) return false;
      if (userFilter.status && u.activeStatus !== userFilter.status) return false;
      if (userFilter.search) {
        const q = userFilter.search.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesEmail = u.email.toLowerCase().includes(q);
        const matchesLocation = u.location?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesLocation) return false;
      }
      return true;
    });
  }, [users, userFilter]);

  async function toggleUserStatus(targetUser: PublicUser) {
    const nextStatus = targetUser.activeStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    const actionLabel = nextStatus === "BLOCKED" ? "block" : "reactivate";
    if (!window.confirm(`Are you sure you want to ${actionLabel} account "${targetUser.name}"?`)) return;

    setWorkingId(targetUser.id);
    try {
      const response = await api.patch<PublicUser>(`/admin/users/${targetUser.id}/status`, {
        activeStatus: nextStatus
      });
      toast.success(response.message || `User status updated to ${nextStatus}.`);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  async function saveCategory(event: FormEvent) {
    event.preventDefault();
    if (!categoryModal) return;
    setWorkingId("category-modal");
    try {
      const payload = {
        name: sanitizeInput(categoryModal.name),
        description: sanitizeInput(categoryModal.description) || undefined
      };
      if (categoryModal.id) {
        const response = await api.patch<Category>(`/admin/categories/${categoryModal.id}`, payload);
        toast.success(response.message || "Discipline updated.");
      } else {
        const response = await api.post<Category>("/admin/categories", payload);
        toast.success(response.message || "New academic discipline added.");
      }
      setCategoryModal(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  async function deleteCategory(category: Category) {
    if (!window.confirm(`Delete the academic discipline "${category.name}"?`)) return;
    setWorkingId(category.id);
    try {
      const response = await api.delete(`/admin/categories/${category.id}`);
      toast.success(response.message || "Category removed.");
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  if (loading) {
    return <Loading label="Loading NextED agency administration system..." />;
  }

  return (
    <div>
      {/* 1. OVERVIEW TAB */}
      {activeTab === "overview" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <span className="eyebrow muted-eyebrow">
                <ShieldCheck size={16} /> Platform Administration
              </span>
              <h2>nextED Agency Command Center</h2>
              <p>Real-time analytics across global admissions, verified advisors, and financial performance.</p>
            </div>
            <span className="status-badge success">
              <Sparkles size={14} /> System Operational 100%
            </span>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <GraduationCap size={24} />
              </div>
              <div className="stat-info">
                <small>Enrolled Students</small>
                <strong>{stats.totalStudents}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon cyan">
                <UsersRound size={24} />
              </div>
              <div className="stat-info">
                <small>Verified Advisors</small>
                <strong>{stats.totalAdvisors}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Layers size={24} />
              </div>
              <div className="stat-info">
                <small>Total Applications</small>
                <strong>{stats.totalBookings}</strong>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon cyan">
                <CreditCard size={24} />
              </div>
              <div className="stat-info">
                <small>Processed Volume</small>
                <strong>{money(stats.totalRevenue)}</strong>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px", marginTop: "24px" }}>
            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "24px" }}>
              <h3 style={{ fontSize: "17px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckCircle2 size={18} style={{ color: "var(--emerald-600)" }} /> Visa Success Metric
              </h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "36px", fontWeight: "850", color: "var(--navy-950)", fontFamily: "var(--font-heading)" }}>
                  98.4%
                </span>
                <span style={{ color: "var(--emerald-600)", fontWeight: "700", fontSize: "14px" }}>+2.1% this quarter</span>
              </div>
              <p style={{ color: "var(--muted)", fontSize: "13px", margin: "8px 0 0 0" }}>
                Over 500+ successful student visas across UK, Australia, USA, and Canada.
              </p>
            </div>

            <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "24px" }}>
              <h3 style={{ fontSize: "17px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Globe2 size={18} style={{ color: "var(--cyan-600)" }} /> Global Partner Institutions
              </h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                <span style={{ fontSize: "36px", fontWeight: "850", color: "var(--navy-950)", fontFamily: "var(--font-heading)" }}>
                  100+
                </span>
                <span style={{ color: "var(--cyan-600)", fontWeight: "700", fontSize: "14px" }}>15 Countries</span>
              </div>
              <p style={{ color: "var(--muted)", fontSize: "13px", margin: "8px 0 0 0" }}>
                Direct API integration with university admissions boards and CAS issuance systems.
              </p>
            </div>
          </div>
        </>
      )}

      {/* 2. STUDENTS & ADVISORS MANAGEMENT TAB */}
      {activeTab === "users" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <h2>Students & Education Advisors Moderation</h2>
              <p>Search registered accounts, view contact credentials, and manage platform permissions.</p>
            </div>
          </div>

          {/* User Filters */}
          <div className="filter-bar" style={{ marginBottom: "24px" }}>
            <div className="filter-search-input" style={{ flex: 1 }}>
              <input
                value={userFilter.search}
                onChange={(e) => setUserFilter({ ...userFilter, search: e.target.value })}
                placeholder="Search user by name, email, or country..."
              />
            </div>

            <select
              className="filter-select"
              value={userFilter.role}
              onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value })}
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Students</option>
              <option value="TECHNICIAN">Education Advisors</option>
              <option value="ADMIN">Platform Admins</option>
            </select>

            <select
              className="filter-select"
              value={userFilter.status}
              onChange={(e) => setUserFilter({ ...userFilter, status: e.target.value })}
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="BLOCKED">Blocked</option>
            </select>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Role</th>
                  <th>Contact Info</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span className="avatar small">{initials(u.name)}</span>
                        <div>
                          <strong>{u.name}</strong>
                          <small style={{ color: "var(--muted)", display: "block" }}>Joined {formatDate(u.createdAt)}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="category-pill">{roleLabel(u.role)}</span>
                    </td>
                    <td>
                      <div>{u.email}</div>
                      <small style={{ color: "var(--muted)" }}>{u.phone || "No phone"}</small>
                    </td>
                    <td>{u.location || "Global"}</td>
                    <td>
                      <StatusBadge status={u.activeStatus} />
                    </td>
                    <td>
                      {u.role !== "ADMIN" && (
                        <button
                          type="button"
                          className={`button button-small ${u.activeStatus === "ACTIVE" ? "button-ghost danger-text" : "button-secondary"}`}
                          onClick={() => toggleUserStatus(u)}
                          disabled={workingId === u.id}
                        >
                          {u.activeStatus === "ACTIVE" ? "Block" : "Reactivate"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 3. ALL APPLICATIONS TAB */}
      {activeTab === "bookings" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <h2>Global Applications & Consultation Sessions</h2>
              <p>Monitor real-time application pipelines across all university programs.</p>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Program / Package</th>
                  <th>Student</th>
                  <th>Assigned Advisor</th>
                  <th>Scheduled Date</th>
                  <th>Milestone Status</th>
                  <th>Fee</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <strong>{booking.service.title}</strong>
                      <small style={{ color: "var(--muted)", display: "block" }}>{booking.service.category?.name || "Program"}</small>
                    </td>
                    <td>
                      <div>{booking.customer.name}</div>
                      <small style={{ color: "var(--muted)" }}>{booking.customer.email}</small>
                    </td>
                    <td>
                      <div>{booking.technician.user?.name || "Advisor"}</div>
                      <small style={{ color: "var(--muted)" }}>{booking.technician.location || "Global"}</small>
                    </td>
                    <td>{formatDate(booking.scheduledAt)}</td>
                    <td>
                      <StatusBadge status={booking.status} />
                    </td>
                    <td>
                      <strong>{money(booking.totalAmount)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 4. FINANCIAL LEDGER TAB */}
      {activeTab === "payments" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <h2>Global Financial Ledger & Gateway Logs</h2>
              <p>Verified transactions processed via Stripe and SSLCOMMERZ checkout integrations.</p>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Gateway Provider</th>
                  <th>Transaction ID</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>
                      <strong>{payment.user?.name || "Student"}</strong>
                      <small style={{ color: "var(--muted)", display: "block" }}>{payment.user?.email}</small>
                    </td>
                    <td>{payment.provider}</td>
                    <td>
                      <code style={{ fontSize: "12px" }}>{payment.transactionId}</code>
                    </td>
                    <td>{formatDate(payment.createdAt)}</td>
                    <td>
                      <StatusBadge status={payment.status} />
                    </td>
                    <td>
                      <strong>{money(payment.amount, payment.currency)}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* 5. ACADEMIC DISCIPLINES / CATEGORIES TAB */}
      {activeTab === "categories" && (
        <>
          <div className="section-heading" style={{ marginBottom: "28px" }}>
            <div>
              <h2>Academic Disciplines & Program Categories</h2>
              <p>Manage the university study fields available in the public exploration catalog.</p>
            </div>
            <button
              type="button"
              className="button button-primary button-small"
              onClick={() => setCategoryModal({ name: "", description: "" })}
            >
              <Plus size={16} /> Add Discipline
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {categories.map((category) => (
              <div key={category.id} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-lg)", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h3 style={{ fontSize: "18px", margin: 0 }}>{category.name}</h3>
                    <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                      {category._count?.services ?? 0} packages
                    </span>
                  </div>
                  <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: "1.5" }}>
                    {category.description || "Global degree programs and university admission pathways."}
                  </p>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px", paddingTop: "14px", borderTop: "1px solid var(--line-soft)" }}>
                  <button
                    type="button"
                    className="button button-ghost button-small"
                    onClick={() =>
                      setCategoryModal({
                        id: category.id,
                        name: category.name,
                        description: category.description || ""
                      })
                    }
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    type="button"
                    className="button button-ghost button-small danger-text"
                    onClick={() => deleteCategory(category)}
                    disabled={workingId === category.id}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Category Modal */}
      {categoryModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h2>{categoryModal.id ? "Edit Academic Discipline" : "New Academic Discipline"}</h2>
              <button type="button" onClick={() => setCategoryModal(null)}>✕</button>
            </div>
            <form onSubmit={saveCategory} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <label className="field">
                <span>Discipline Name</span>
                <input
                  required
                  placeholder="e.g. Data Science & Artificial Intelligence"
                  value={categoryModal.name}
                  onChange={(e) => setCategoryModal({ ...categoryModal, name: e.target.value })}
                  style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)" }}
                />
              </label>

              <label className="field">
                <span>Description / Curriculum Overview</span>
                <textarea
                  rows={4}
                  placeholder="Brief summary of programs, career prospects, and international demand in this discipline..."
                  value={categoryModal.description}
                  onChange={(e) => setCategoryModal({ ...categoryModal, description: e.target.value })}
                  style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "var(--radius-md)", resize: "vertical" }}
                />
              </label>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" className="button button-ghost" onClick={() => setCategoryModal(null)}>
                  Cancel
                </button>
                <button type="submit" className="button button-primary" disabled={workingId === "category-modal"}>
                  {workingId === "category-modal" ? "Saving..." : categoryModal.id ? "Save Changes" : "Create Discipline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
