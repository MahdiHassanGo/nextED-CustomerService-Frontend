import { ServicesPageClient } from "@/components/ServicesPageClient";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Browse Services", description: "Search home services by category, location, rating, and price." };
export const dynamic = "force-dynamic";

export default function ServicesPage() {
  return <Suspense fallback={<div className="page-loading">Loading services…</div>}><ServicesPageClient /></Suspense>;
}
