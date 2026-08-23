"use client";

import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import { sanitizeInput } from "@/lib/security";
import type { PublicUser } from "@/lib/types";
import { getErrorMessage, initials, roleLabel } from "@/lib/utils";
import { Globe2, Mail, MapPin, Phone, Save, ShieldCheck, Sparkles, UserRound } from "lucide-react";
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
      toast.success(response.message || "Profile updated successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="section-heading" style={{ marginBottom: "28px" }}>
        <div>
          <span className="eyebrow muted-eyebrow">
            <Sparkles size={16} /> Account Information
          </span>
          <h2>{roleLabel(user.role)} Profile Settings</h2>
          <p>Manage your contact details, study abroad destination preferences, and communication channels.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "32px", alignItems: "start" }}>
        <aside style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "28px", textAlign: "center" }}>
          <span className="avatar xlarge" style={{ margin: "0 auto 16px auto" }}>{initials(user.name)}</span>
          <h3 style={{ fontSize: "18px", margin: "0 0 6px 0" }}>{user.name}</h3>
          <span className="category-pill" style={{ marginBottom: "16px" }}>{roleLabel(user.role)}</span>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", textAlign: "left", paddingTop: "16px", borderTop: "1px solid var(--line-soft)", fontSize: "13.5px", color: "var(--muted)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Mail size={16} /> {user.email}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldCheck size={16} /> Account Status: <strong style={{ color: "var(--emerald-600)" }}>{user.activeStatus}</strong>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Globe2 size={16} /> Location: <strong>{user.location || "Global"}</strong>
            </span>
          </div>
        </aside>

        <form onSubmit={submit} style={{ background: "#fff", border: "1px solid var(--line)", borderRadius: "var(--radius-xl)", padding: "32px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <h3 style={{ fontSize: "18px", margin: 0 }}>Contact Details & Location</h3>

          <label className="field">
            <span>Full Name</span>
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
            <span>Phone Number</span>
            <div className="input-icon">
              <Phone size={17} />
              <input
                minLength={6}
                maxLength={30}
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="e.g. +44 20 7946 0912 / +880 17XXXXXXXX"
              />
            </div>
          </label>

          <label className="field">
            <span>Current City / Target Country</span>
            <div className="input-icon">
              <MapPin size={17} />
              <input
                minLength={2}
                maxLength={180}
                value={form.location}
                onChange={(event) => setForm({ ...form, location: event.target.value })}
                placeholder="e.g. London, UK / Dhaka, Bangladesh"
              />
            </div>
          </label>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "12px" }}>
            <button type="submit" className="button button-primary" disabled={saving}>
              <Save size={17} /> {saving ? "Saving Changes…" : "Save Profile Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
