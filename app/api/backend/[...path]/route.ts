import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const backendUrl = (process.env.BACKEND_URL ?? "https://fix-it-now-6b1c.vercel.app").replace(/\/$/, "");
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const MAX_BODY_BYTES = 1024 * 1024; // 1 MB limit

function secureEqual(left: string, right: string): boolean {
  try {
    const a = Buffer.from(left);
    const b = Buffer.from(right);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function verifyMutationRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  const expectedOrigin = `${proto}://${host}`;

  const fetchSite = request.headers.get("sec-fetch-site");
  const requestedWith = request.headers.get("x-requested-with");
  const csrfHeader = request.headers.get("x-csrf-token");
  const csrfName = process.env.NODE_ENV === "production" ? "__Host-nexted_csrf" : "nexted_csrf";
  const csrfCookie = request.cookies.get(csrfName)?.value;

  // Origin verification
  if (origin && origin !== expectedOrigin && origin !== request.nextUrl.origin) {
    return false;
  }

  // Sec-Fetch-Site verification (when provided by browser)
  if (fetchSite && !["same-origin", "same-site"].includes(fetchSite)) {
    return false;
  }

  // Custom header verification
  if (requestedWith !== "NextED-Web") {
    return false;
  }

  // CSRF token verification
  if (!csrfHeader || !csrfCookie) {
    return false;
  }

  return secureEqual(csrfHeader, csrfCookie);
}

function copyResponseHeaders(upstream: Response, response: NextResponse): void {
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

  // Strip sensitive headers
  response.headers.delete("server");
  response.headers.delete("x-powered-by");

  // Prevent caching of API responses
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  response.headers.set("X-Content-Type-Options", "nosniff");
}

function isValidPathSegment(segment: string): boolean {
  if (!segment || segment.length > 256) return false;
  const decoded = decodeURIComponent(segment);
  if (
    decoded === "." ||
    decoded === ".." ||
    decoded.includes("/") ||
    decoded.includes("\\") ||
    decoded.includes("\0")
  ) {
    return false;
  }
  return true;
}

async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const method = request.method.toUpperCase();

  // Validate state-changing mutations
  if (!SAFE_METHODS.has(method) && !verifyMutationRequest(request)) {
    return NextResponse.json(
      {
        success: false,
        statusCode: 403,
        message: "Security validation failed. Please refresh the page and try again.",
        data: null
      },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store, max-age=0"
        }
      }
    );
  }

  // Check content length header
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { success: false, statusCode: 413, message: "Request payload exceeds maximum allowed size.", data: null },
      { status: 413 }
    );
  }

  const { path } = await context.params;
  if (!path?.length || path.length > 32 || !path.every(isValidPathSegment)) {
    return NextResponse.json(
      { success: false, statusCode: 400, message: "Invalid API path requested.", data: null },
      { status: 400 }
    );
  }

  const target = new URL(`${backendUrl}/api/${path.map(encodeURIComponent).join("/")}`);
  target.search = request.nextUrl.search;

  // Safe header forwarding
  const headers = new Headers();
  for (const name of ["accept", "accept-language", "content-type", "cookie", "user-agent"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || request.nextUrl.host;
  const proto = request.headers.get("x-forwarded-proto") || request.nextUrl.protocol.replace(":", "");
  headers.set("x-forwarded-host", host);
  headers.set("x-forwarded-proto", proto);

  const clientIp = request.headers.get("x-forwarded-for");
  if (clientIp) {
    headers.set("x-forwarded-for", clientIp);
  }

  let body: ArrayBuffer | undefined;
  if (!SAFE_METHODS.has(method)) {
    body = await request.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, statusCode: 413, message: "Request payload exceeds maximum allowed size.", data: null },
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
      { success: false, statusCode: 502, message: "The backend service is temporarily unavailable. Please retry shortly.", data: null },
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
