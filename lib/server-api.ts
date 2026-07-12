import "server-only";
import { cookies } from "next/headers";
import type { ApiEnvelope } from "./types";

const backendUrl = (process.env.BACKEND_URL ?? "https://fix-it-now-6b1c.vercel.app").replace(/\/$/, "");

export async function serverApi<T>(path: string): Promise<ApiEnvelope<T> | null> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.getAll().map(({ name, value }) => `${name}=${value}`).join("; ");
  try {
    const response = await fetch(`${backendUrl}/api${path.startsWith("/") ? path : `/${path}`}`, {
      headers: { Accept: "application/json", Cookie: cookieHeader },
      cache: "no-store",
      signal: AbortSignal.timeout(12000)
    });
    if (!response.ok) return null;
    return (await response.json()) as ApiEnvelope<T>;
  } catch {
    return null;
  }
}
