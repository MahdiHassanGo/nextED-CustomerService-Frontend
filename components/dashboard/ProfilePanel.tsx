"use client";

import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import { sanitizeInput } from "@/lib/security";
import type { PublicUser } from "@/lib/types";
import { getErrorMessage, initials, roleLabel } from "@/lib/utils";
import { Mail, MapPin, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import { FormEvent, useState } from "react";

interface ProfilePanelProps {
  user: PublicUser;
  onUpdated: (user: PublicUser) => void;
}

export function ProfilePanel({ user, onUpdated }: ProfilePanelProps) {
  const toast = useToast();
  const { setUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone ?? "",
    location: user.location ?? ""
  });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const sanitizedName = sanitizeInput(form.name);
      const sanitizedPhone = sanitizeInput(form.phone);
      const sanitizedLocation = sanitizeInput(form.location);
      const response = await api.patch<PublicUser>("/users/me", {
        name: sanitizedName,
        phone: sanitizedPhone || null,
        location: sanitizedLocation || null
      });
      onUpdated({ ...user, ...response.data });
      setUser({ ...user, ...response.data });
      toast.success(response.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-section">
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow muted-eyebrow">Account settings</span>
          <h1>Your profile</h1>
          <p>Update the contact information associated with your authenticated account.</p>
        </div>
      </div>

      <div className="profile-settings-grid">
        <aside className="profile-summary">
          <span className="avatar profile-settings-avatar">{initials(user.name)}</span>
          <h2>{user.name}</h2>
          <span className="status-badge status-success">{roleLabel(user.role)}</span>

          <div>
            <span>
              <Mail size={16} /> {user.email}
            </span>
            <span>
              <ShieldCheck size={16} /> {user.activeStatus}
            </span>
          </div>

          <p>Email address and assigned role permissions are securely managed by platform administrators.</p>
        </aside>

        <form className="panel-card settings-form" onSubmit={submit}>
          <h2>Personal information</h2>

          <label className="field">
            <span>Full name</span>
            <div className="input-icon">
              <UserRound size={17} />
              <input
                required
                minLength={2}
                maxLength={120}
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Your full name"
              />
            </div>
          </label>

          <label className="field">
            <span>Phone</span>
            <div className="input-icon">
              <Phone size={17} />
              <input
                minLength={6}
                maxLength={30}
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="Optional contact number"
              />
            </div>
          </label>

          <label className="field">
            <span>Location</span>
            <div className="input-icon">
              <MapPin size={17} />
              <input
                minLength={2}
                maxLength={180}
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                placeholder="Optional city or area"
              />
            </div>
          </label>

          <button type="submit" className="button button-primary" disabled={saving}>
            <Save size={17} /> {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
