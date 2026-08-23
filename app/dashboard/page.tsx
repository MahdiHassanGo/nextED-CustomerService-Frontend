import { DashboardShell } from "@/components/DashboardShell";
import { serverApi } from "@/lib/server-api";
import type { PublicUser } from "@/lib/types";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Student & Advisor Workspace", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const response = await serverApi<PublicUser>("/auth/me");
  if (!response?.data) redirect("/auth/login?next=/dashboard");
  return (
    <Suspense fallback={<div className="page-loading">Loading nextED workspace…</div>}>
      <DashboardShell initialUser={response.data} />
    </Suspense>
  );
}
