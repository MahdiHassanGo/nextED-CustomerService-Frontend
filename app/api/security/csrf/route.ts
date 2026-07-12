import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const token = randomBytes(32).toString("base64url");
  const production = process.env.NODE_ENV === "production";
  const cookieName = production ? "__Host-fixit_csrf" : "fixit_csrf";
  const response = NextResponse.json({ token });
  response.cookies.set({
    name: cookieName,
    value: token,
    httpOnly: true,
    secure: production,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 8
  });
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}
