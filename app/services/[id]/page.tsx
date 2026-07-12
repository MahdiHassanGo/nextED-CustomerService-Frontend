import { ServiceDetailsClient } from "@/components/ServiceDetailsClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Service Details" };
export const dynamic = "force-dynamic";

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ServiceDetailsClient id={id} />;
}
