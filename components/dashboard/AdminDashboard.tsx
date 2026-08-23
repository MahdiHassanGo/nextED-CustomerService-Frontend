"use client";

import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { StatusBadge } from "@/components/StatusBadge";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import { sanitizeInput } from "@/lib/security";
import type { Booking, Category, Payment, PublicUser } from "@/lib/types";
import { formatDate, getErrorMessage, initials, money, roleLabel } from "@/lib/utils";
import {
  Ban,
  CalendarCheck2,
  CheckCircle2,
  CreditCard,
  Edit3,
  FolderCog,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserCheck,
  UsersRound
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

  const stats = useMemo(() => ({
    users: users.length,
    technicians: users.filter((item) => item.role === "TECHNICIAN").length,
    bookings: bookings.length,
    verifiedPayments: payments.filter((payment) => payment.status === "COMPLETED").length
  }), [users, bookings, payments]);

  const filteredUsers = useMemo(() => {
    return users.filter((item) => {
      const search = userFilter.search.toLowerCase();
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search) ||
        item.email.toLowerCase().includes(search) ||
        (item.location && item.location.toLowerCase().includes(search));
      const matchRole = !userFilter.role || item.role === userFilter.role;
      const matchStatus = !userFilter.status || item.activeStatus === userFilter.status;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, userFilter]);

  async function changeStatus(target: PublicUser) {
    const activeStatus = target.activeStatus === "ACTIVE" ? "BLOCKED" : "ACTIVE";
    if (!window.confirm(`${activeStatus === "BLOCKED" ? "Block" : "Activate"} ${target.name}?`)) return;
    setWorkingId(target.id);
    try {
      const response = await api.patch<PublicUser>(`/admin/users/${target.id}/status`, { activeStatus });
      toast.success(response.message);
      setUsers((current) =>
        current.map((item) =>
          item.id === target.id ? { ...item, activeStatus: response.data.activeStatus } : item
        )
      );
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  async function saveCategory(event: FormEvent) {
    event.preventDefault();
    if (!categoryModal) return;
    setWorkingId(categoryModal.id ?? "new-category");
    try {
      const sanitizedName = sanitizeInput(categoryModal.name);
      const sanitizedDescription = sanitizeInput(categoryModal.description);
      const payload = {
        name: sanitizedName,
        description: sanitizedDescription || undefined
      };
      const response = categoryModal.id
        ? await api.patch<Category>(`/admin/categories/${categoryModal.id}`, payload)
        : await api.post<Category>("/admin/categories", payload);

      toast.success(response.message);
      setCategoryModal(null);
      await load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  async function deleteCategory(category: Category) {
    if (!window.confirm(`Delete the category “${category.name}”? This works only when no services use it.`)) return;
    setWorkingId(category.id);
    try {
      const response = await api.delete<{ id: string }>(`/admin/categories/${category.id}`);
      toast.success(response.message);
      setCategories((current) => current.filter((item) => item.id !== category.id));
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorkingId(null);
    }
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loading label="Loading administration workspace" />
      </div>
    );
  }

  // 1. Overview Tab
  if (activeTab === "overview") {
    const recentBookings = bookings.slice(0, 5);

    return (
      <div className="dashboard-section">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow muted-eyebrow">Administration</span>
            <h1>Platform overview</h1>
            <p>Monitor users, booking activity, payment records, and service taxonomy.</p>
          </div>
          <span className="admin-chip">
            <ShieldCheck size={17} /> Privileged access
          </span>
        </div>

        <div className="stats-grid">
          <article>
            <span className="stat-icon">
              <UsersRound />
            </span>
            <small>Total users</small>
            <strong>{stats.users}</strong>
            <span>All registered accounts</span>
          </article>

          <article>
            <span className="stat-icon">
              <UserCheck />
            </span>
            <small>Technicians</small>
            <strong>{stats.technicians}</strong>
            <span>Professional service providers</span>
          </article>

          <article>
            <span className="stat-icon">
              <CalendarCheck2 />
            </span>
            <small>Total bookings</small>
            <strong>{stats.bookings}</strong>
            <span>Across all statuses</span>
          </article>

          <article>
            <span className="stat-icon">
              <CreditCard />
            </span>
            <small>Verified payments</small>
            <strong>{stats.verifiedPayments}</strong>
            <span>Completed gateway transactions</span>
          </article>
        </div>

        <div className="panel-card">
          <div className="panel-heading">
            <div>
              <h2>Recent booking activity</h2>
              <p>Latest platform-wide customer requests.</p>
            </div>
          </div>

          {recentBookings.length > 0 ? (
            <div className="booking-list">
              {recentBookings.map((booking) => (
                <article className="booking-row" key={booking.id}>
                  <div className="booking-date">
                    <strong>
                      {new Date(booking.createdAt).toLocaleDateString("en-BD", { day: "2-digit" })}
                    </strong>
                    <small>
                      {new Date(booking.createdAt).toLocaleDateString("en-BD", { month: "short" })}
                    </small>
                  </div>
                  <div className="booking-info">
                    <span className="category-pill">{booking.service.category.name}</span>
                    <h3>{booking.service.title}</h3>
                    <p>
                      {booking.customer.name} → {booking.technician.user.name}
                    </p>
                    <small>{formatDate(booking.scheduledAt)}</small>
                  </div>
                  <div className="booking-amount">
                    <strong>{money(booking.totalAmount)}</strong>
                    <StatusBadge status={booking.status} />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState title="No bookings" description="Platform bookings will appear here." />
          )}
        </div>

        <div className="dashboard-security-banner">
          <ShieldCheck size={24} />
          <span>
            <strong>Administrative actions remain backend-enforced</strong>
            <small>
              This interface cannot create admins, expose passwords, bypass ownership, or override payment verification.
            </small>
          </span>
        </div>
      </div>
    );
  }

  // 2. Users Tab
  if (activeTab === "users") {
    return (
      <div className="dashboard-section">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow muted-eyebrow">Account moderation</span>
            <h1>Users</h1>
            <p>Search accounts and change supported active or blocked statuses.</p>
          </div>
        </div>

        <div className="table-filters">
          <input
            value={userFilter.search}
            onChange={(event) => setUserFilter({ ...userFilter, search: event.target.value })}
            placeholder="Search name, email, or location"
          />
          <select
            value={userFilter.role}
            onChange={(event) => setUserFilter({ ...userFilter, role: event.target.value })}
          >
            <option value="">All roles</option>
            <option value="CUSTOMER">Customers</option>
            <option value="TECHNICIAN">Technicians</option>
            <option value="ADMIN">Admins</option>
          </select>
          <select
            value={userFilter.status}
            onChange={(event) => setUserFilter({ ...userFilter, status: event.target.value })}
          >
            <option value="">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>

        {filteredUsers.length > 0 ? (
          <div className="table-card">
            <div className="data-table user-table">
              <div className="table-head">
                <span>User</span>
                <span>Role</span>
                <span>Location</span>
                <span>Joined</span>
                <span>Status</span>
                <span>Action</span>
              </div>
              {filteredUsers.map((item) => (
                <div className="table-row" key={item.id}>
                  <span data-label="User" className="table-user">
                    <span className="avatar small">{initials(item.name)}</span>
                    <span>
                      <strong>{item.name}</strong>
                      <small>{item.email}</small>
                    </span>
                  </span>
                  <span data-label="Role">{roleLabel(item.role)}</span>
                  <span data-label="Location">{item.location || "—"}</span>
                  <span data-label="Joined">
                    {formatDate(item.createdAt, { dateStyle: "medium", timeStyle: undefined })}
                  </span>
                  <span data-label="Status">
                    <StatusBadge status={item.activeStatus} />
                  </span>
                  <span data-label="Action">
                    <button
                      type="button"
                      className={`button button-small ${
                        item.activeStatus === "ACTIVE" ? "button-ghost danger-text" : "button-secondary"
                      }`}
                      disabled={workingId === item.id || item.id === user.id}
                      onClick={() => changeStatus(item)}
                    >
                      {item.activeStatus === "ACTIVE" ? <Ban size={15} /> : <CheckCircle2 size={15} />}
                      {workingId === item.id ? "Updating…" : item.activeStatus === "ACTIVE" ? "Block" : "Activate"}
                    </button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No users match the filters"
            description="Clear one or more filters to broaden your search results."
          />
        )}
      </div>
    );
  }

  // 3. Bookings Tab
  if (activeTab === "bookings") {
    return (
      <div className="dashboard-section">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow muted-eyebrow">Platform activity</span>
            <h1>All bookings</h1>
            <p>Operational overview of all system bookings and current status lifecycles.</p>
          </div>
        </div>

        {bookings.length > 0 ? (
          <div className="table-card">
            <div className="data-table booking-table">
              <div className="table-head">
                <span>Service</span>
                <span>Customer</span>
                <span>Technician</span>
                <span>Schedule</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {bookings.map((booking) => (
                <div className="table-row" key={booking.id}>
                  <span data-label="Service">
                    <strong>{booking.service.title}</strong>
                    <small>{booking.service.category.name}</small>
                  </span>
                  <span data-label="Customer">
                    <strong>{booking.customer.name}</strong>
                    <small>{booking.customer.email}</small>
                  </span>
                  <span data-label="Technician">
                    <strong>{booking.technician.user.name}</strong>
                    <small>{booking.technician.user.email}</small>
                  </span>
                  <span data-label="Schedule">{formatDate(booking.scheduledAt)}</span>
                  <span data-label="Amount">{money(booking.totalAmount)}</span>
                  <span data-label="Status">
                    <StatusBadge status={booking.status} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="No bookings" description="There are no platform bookings created yet." />
        )}
      </div>
    );
  }

  // 4. Payments Tab
  if (activeTab === "payments") {
    return (
      <div className="dashboard-section">
        <div className="dashboard-heading">
          <div>
            <span className="eyebrow muted-eyebrow">Financial records</span>
            <h1>All payments</h1>
            <p>Gateway-created transactions and server-verified statuses across the platform.</p>
          </div>
        </div>

        {payments.length > 0 ? (
          <div className="table-card">
            <div className="data-table admin-payment-table">
              <div className="table-head">
                <span>Transaction</span>
                <span>User</span>
                <span>Provider</span>
                <span>Amount</span>
                <span>Status</span>
                <span>Created</span>
              </div>
              {payments.map((payment) => (
                <div className="table-row" key={payment.id}>
                  <span data-label="Transaction">
                    <strong>{payment.transactionId}</strong>
                    <small>{payment.method || "Hosted checkout"}</small>
                  </span>
                  <span data-label="User">
                    <strong>{payment.user?.name || "Customer"}</strong>
                    <small>{payment.user?.email || payment.userId}</small>
                  </span>
                  <span data-label="Provider">{payment.provider}</span>
                  <span data-label="Amount">{money(payment.amount, payment.currency)}</span>
                  <span data-label="Status">
                    <StatusBadge status={payment.status} />
                  </span>
                  <span data-label="Created">{formatDate(payment.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            title="No payments"
            description="Payment records are created once bookings enter checkout."
          />
        )}
      </div>
    );
  }

  // 5. Categories Tab
  return (
    <div className="dashboard-section">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow muted-eyebrow">Service taxonomy</span>
          <h1>Categories</h1>
          <p>Create and edit categories. Deletion is safely blocked while services use a category.</p>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => setCategoryModal({ name: "", description: "" })}
        >
          <Plus size={17} /> Add category
        </button>
      </div>

      {categories.length > 0 ? (
        <div className="management-grid category-management-grid">
          {categories.map((category) => (
            <article className="management-card" key={category.id}>
              <div className="management-card-head">
                <span className="service-icon small-service-icon">
                  <FolderCog size={20} />
                </span>
                <span className="category-count">{category._count?.services ?? 0} services</span>
              </div>
              <h3>{category.name}</h3>
              <p>{category.description || "No category description has been provided."}</p>
              <div className="management-actions">
                <button
                  type="button"
                  className="button button-secondary button-small"
                  onClick={() =>
                    setCategoryModal({
                      id: category.id,
                      name: category.name,
                      description: category.description ?? ""
                    })
                  }
                >
                  <Edit3 size={15} /> Edit
                </button>
                <button
                  type="button"
                  className="button button-ghost button-small danger-text"
                  disabled={workingId === category.id}
                  onClick={() => deleteCategory(category)}
                >
                  <Trash2 size={15} /> {workingId === category.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No categories"
          description="Create the first service category for technicians to list under."
          action={
            <button
              type="button"
              className="button button-primary"
              onClick={() => setCategoryModal({ name: "", description: "" })}
            >
              Create category
            </button>
          }
        />
      )}

      {categoryModal && (
        <CategoryModal
          form={categoryModal}
          setForm={setCategoryModal}
          busy={workingId === (categoryModal.id ?? "new-category")}
          onClose={() => setCategoryModal(null)}
          onSubmit={saveCategory}
        />
      )}
    </div>
  );
}

interface CategoryModalProps {
  form: CategoryForm;
  setForm: (form: CategoryForm | null) => void;
  busy: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}

function CategoryModal({ form, setForm, busy, onClose, onSubmit }: CategoryModalProps) {
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="modal compact-modal" role="dialog" aria-modal="true">
        <div className="modal-head">
          <div>
            <span className="eyebrow muted-eyebrow">Admin category</span>
            <h2>{form.id ? "Edit category" : "Create category"}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <label className="field">
            <span>Name</span>
            <input
              required
              minLength={2}
              maxLength={100}
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. Carpentry & Woodwork"
            />
          </label>

          <label className="field">
            <span>
              Description <small>(optional)</small>
            </span>
            <textarea
              rows={4}
              maxLength={1000}
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Describe what services fall under this category…"
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="button button-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button button-primary" disabled={busy}>
              <Save size={16} /> {busy ? "Saving…" : "Save category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
