import { TechniciansPageClient } from "@/components/TechniciansPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Find Professionals", description: "Search trusted technicians by skill, location, rating, experience, and hourly rate." };
export const dynamic = "force-dynamic";

export default function TechniciansPage() {
  return <TechniciansPageClient />;
}
