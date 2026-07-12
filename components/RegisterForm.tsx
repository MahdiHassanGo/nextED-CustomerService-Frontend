"use client";

import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import type { PublicUser, Role } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";
import { BriefcaseBusiness, Eye, EyeOff, LockKeyhole, Mail, MapPin, Phone, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", location: "", role: "CUSTOMER" as Exclude<Role, "ADMIN"> });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, phone: form.phone || undefined, location: form.location || undefined };
      const response = await api.post<PublicUser>("/auth/register", payload);
      toast.success(response.message);
      router.push("/auth/login");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <fieldset className="role-selector"><legend>I want to join as</legend><label className={form.role === "CUSTOMER" ? "selected" : ""}><input type="radio" name="role" value="CUSTOMER" checked={form.role === "CUSTOMER"} onChange={() => setForm({ ...form, role: "CUSTOMER" })} /><UserRound size={21} /><span><strong>Customer</strong><small>Book and review services</small></span></label><label className={form.role === "TECHNICIAN" ? "selected" : ""}><input type="radio" name="role" value="TECHNICIAN" checked={form.role === "TECHNICIAN"} onChange={() => setForm({ ...form, role: "TECHNICIAN" })} /><BriefcaseBusiness size={21} /><span><strong>Technician</strong><small>Publish services and manage jobs</small></span></label></fieldset>
      <label className="field"><span>Full name</span><div className="input-icon"><UserRound size={18} /><input required minLength={2} maxLength={120} autoComplete="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your full name" /></div></label>
      <label className="field"><span>Email address</span><div className="input-icon"><Mail size={18} /><input required type="email" maxLength={180} autoComplete="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></div></label>
      <div className="field-row"><label className="field"><span>Phone <small>(optional)</small></span><div className="input-icon"><Phone size={17} /><input minLength={6} maxLength={30} autoComplete="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="01XXXXXXXXX" /></div></label><label className="field"><span>Location <small>(optional)</small></span><div className="input-icon"><MapPin size={17} /><input minLength={2} maxLength={180} autoComplete="address-level2" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} placeholder="Dhaka" /></div></label></div>
      <label className="field"><span>Password</span><div className="input-icon"><LockKeyhole size={18} /><input required type={showPassword ? "text" : "password"} minLength={8} maxLength={72} pattern="(?=.*[A-Za-z])(?=.*\d).{8,72}" title="Use 8–72 characters with at least one letter and one number" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><small>Must include at least one letter and one number.</small></label>
      <button type="submit" className="button button-primary button-full button-large" disabled={loading}>{loading ? "Creating account…" : `Create ${form.role === "CUSTOMER" ? "customer" : "technician"} account`}</button>
      <p className="auth-security"><ShieldCheck size={16} /> Admin registration is intentionally disabled for security.</p>
      <p className="auth-switch">Already have an account? <Link href="/auth/login">Sign in</Link></p>
    </form>
  );
}
