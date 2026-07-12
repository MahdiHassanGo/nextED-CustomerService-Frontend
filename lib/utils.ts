import type { BookingStatus, PaymentStatus, Role } from "./types";

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function money(value: string | number | null | undefined, currency = "BDT") {
  const amount = Number(value ?? 0);
  try {
    return new Intl.NumberFormat("en-BD", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatDate(value: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Dhaka",
    ...options
  }).format(new Date(value));
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "FN";
}

export function roleLabel(role: Role) {
  return role.charAt(0) + role.slice(1).toLowerCase();
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
