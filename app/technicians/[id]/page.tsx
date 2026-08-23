import { TechnicianDetailsClient } from "@/components/TechnicianDetailsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Education Advisor Profile" };
export const dynamic = "force-dynamic";

export default async function TechnicianDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TechnicianDetailsClient id={id} />;
}
