import { TechniciansPageClient } from "@/components/TechniciansPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Education Advisors & Consultants",
  description: "Connect with certified university admissions advisors, visa counselors, and study abroad consultants."
};
export const dynamic = "force-dynamic";

export default function TechniciansPage() {
  return <TechniciansPageClient />;
}
