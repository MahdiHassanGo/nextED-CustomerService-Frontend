"use client";

import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { api } from "@/lib/api-client";
import type { PublicUser } from "@/lib/types";
import { getErrorMessage } from "@/lib/utils";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post<{ user: PublicUser }>("/auth/login", form);
      setUser(response.data.user);
      toast.success("Welcome back. Your secure session is active.");
      const requested = searchParams.get("next");
      const destination = requested && requested.startsWith("/") && !requested.startsWith("//") ? requested : "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <label className="field"><span>Email address</span><div className="input-icon"><Mail size={18} /><input type="email" required autoComplete="email" maxLength={180} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" /></div></label>
      <label className="field"><span>Password</span><div className="input-icon"><LockKeyhole size={18} /><input type={showPassword ? "text" : "password"} required autoComplete="current-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Enter your password" /><button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
      <button type="submit" className="button button-primary button-full button-large" disabled={loading}>{loading ? "Signing in securely…" : "Sign in"}</button>
      <p className="auth-security"><ShieldCheck size={16} /> Authentication tokens are stored only in HTTP-only cookies.</p>
      <p className="auth-switch">New to FixItNow? <Link href="/auth/register">Create an account</Link></p>
    </form>
  );
}
