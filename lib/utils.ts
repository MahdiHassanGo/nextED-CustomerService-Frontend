import type { BookingStatus, PaymentStatus, Role } from "./types";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function money(value: string | number | null | undefined, currency = "USD") {
  const amount = Number(value ?? 0);
  try {
    const locale = currency === "BDT" ? "en-BD" : currency === "GBP" ? "en-GB" : currency === "EUR" ? "de-DE" : "en-US";
    return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `$${amount.toLocaleString()} ${currency}`;
  }
}

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    ...options
  }).format(new Date(value));
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "NE";
}

export function roleLabel(role: Role): string {
  if (role === "CUSTOMER") return "Student";
  if (role === "TECHNICIAN") return "Education Advisor";
  if (role === "ADMIN") return "Platform Admin";
  return role;
}

export function applicationStatusLabel(status: BookingStatus): string {
  switch (status) {
    case "REQUESTED":
      return "Application Submitted";
    case "ACCEPTED":
      return "Advisor Reviewing";
    case "PAID":
      return "Processing & Filing";
    case "IN_PROGRESS":
      return "University Under Review";
    case "COMPLETED":
      return "Offer Issued / Admitted";
    case "DECLINED":
      return "Declined";
    case "CANCELLED":
      return "Withdrawn / Cancelled";
    default:
      return humanize(status);
  }
}

export function statusTone(status: BookingStatus | PaymentStatus | "ACTIVE" | "BLOCKED") {
  if (["COMPLETED", "ACTIVE", "PAID"].includes(status)) return "success";
  if (["ACCEPTED", "IN_PROGRESS", "PENDING", "REQUESTED"].includes(status)) return "warning";
  if (["DECLINED", "FAILED", "BLOCKED"].includes(status)) return "danger";
  return "muted";
}

export function humanize(value: string) {
  return value.toLowerCase().split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
