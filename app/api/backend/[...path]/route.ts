import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const backendUrl = (process.env.BACKEND_URL ?? "https://fix-it-now-6b1c.vercel.app").replace(/\/$/, "");
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const MAX_BODY_BYTES = 1024 * 1024;

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function verifyMutationRequest(request: NextRequest) {
  const origin = request.headers.get("origin");
  const expectedOrigin = request.nextUrl.origin;
  const fetchSite = request.headers.get("sec-fetch-site");
  const requestedWith = request.headers.get("x-requested-with");
  const csrfHeader = request.headers.get("x-csrf-token");
  const csrfName = process.env.NODE_ENV === "production" ? "__Host-fixit_csrf" : "fixit_csrf";
  const csrfCookie = request.cookies.get(csrfName)?.value;

  if (origin !== expectedOrigin || (fetchSite && fetchSite !== "same-origin")) return false;
  if (requestedWith !== "FixItNow-Web" || !csrfHeader || !csrfCookie) return false;
  return secureEqual(csrfHeader, csrfCookie);
}

function copyResponseHeaders(upstream: Response, response: NextResponse) {
  const contentType = upstream.headers.get("content-type");
  const location = upstream.headers.get("location");
  if (contentType) response.headers.set("Content-Type", contentType);
  if (location) response.headers.set("Location", location);

  const headersWithCookies = upstream.headers as Headers & { getSetCookie?: () => string[] };
  const setCookies = headersWithCookies.getSetCookie?.() ?? [];
  for (const cookie of setCookies) {
    const normalized = process.env.NODE_ENV === "production"
      ? cookie
      : cookie.replace(/;\s*Secure/gi, "").replace(/SameSite=None/gi, "SameSite=Lax");
    response.headers.append("Set-Cookie", normalized);
  }

  if (setCookies.length === 0) {
    const cookie = upstream.headers.get("set-cookie");
    if (cookie) {
      const normalized = process.env.NODE_ENV === "production"
        ? cookie
        : cookie.replace(/;\s*Secure/gi, "").replace(/SameSite=None/gi, "SameSite=Lax");
      response.headers.append("Set-Cookie", normalized);
    }
  }
  response.headers.set("Cache-Control", "no-store, max-age=0");
}

async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const method = request.method.toUpperCase();
  if (!SAFE_METHODS.has(method) && !verifyMutationRequest(request)) {
    return NextResponse.json(
      { success: false, statusCode: 403, message: "Security validation failed. Refresh the page and try again.", data: null },
      { status: 403 }
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { success: false, statusCode: 413, message: "Request body is too large.", data: null },
      { status: 413 }
    );
  }

  const { path } = await context.params;
  if (!path?.length || path.some((segment) => !segment || segment === "." || segment === "..")) {
    return NextResponse.json({ success: false, statusCode: 400, message: "Invalid API path.", data: null }, { status: 400 });
  }

  const target = new URL(`${backendUrl}/api/${path.map(encodeURIComponent).join("/")}`);
  target.search = request.nextUrl.search;

  const headers = new Headers();
  for (const name of ["accept", "content-type", "cookie", "user-agent"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("x-forwarded-host", request.nextUrl.host);
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  let body: ArrayBuffer | undefined;
  if (!SAFE_METHODS.has(method)) {
    body = await request.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, statusCode: 413, message: "Request body is too large.", data: null },
        { status: 413 }
      );
    }
  }

  try {
    const upstream = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(20000)
    });
    const payload = await upstream.arrayBuffer();
    const response = new NextResponse(payload, { status: upstream.status, statusText: upstream.statusText });
    copyResponseHeaders(upstream, response);
    return response;
  } catch {
    return NextResponse.json(
      { success: false, statusCode: 502, message: "The backend service is temporarily unavailable.", data: null },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
