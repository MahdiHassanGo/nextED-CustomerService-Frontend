import { ServicesPageClient } from "@/components/ServicesPageClient";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Courses & Study Abroad Programs",
  description: "Search university degrees, admission packages, and certified education consultant advisory sessions across 15 countries."
};
export const dynamic = "force-dynamic";

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="section" style={{ textAlign: "center" }}>Loading study programs…</div>}>
      <ServicesPageClient />
    </Suspense>
  );
}
