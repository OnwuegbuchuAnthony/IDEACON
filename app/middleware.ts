import { NextResponse, type NextRequest } from "next/server";

/**
 * Phase 5 edge rate limiting (single-device friendly, in-memory).
 * API routes: 60 req/min/IP. Auth routes: 15 req/min/IP.
 * NOTE: per-process memory — fine for one box; use Redis when scaling out.
 */
const buckets = new Map<string, { count: number; reset: number }>();

function hit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  b.count++;
  return b.count <= limit;
}

export function middleware(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local";
  const path = req.nextUrl.pathname;
  const isAuth = path.startsWith("/api/auth");
  const isApi = path.startsWith("/api/");
  if (!isApi) return NextResponse.next();

  const limit = isAuth ? 15 : 60;
  if (!hit(`${ip}:${isAuth ? "auth" : "api"}`, limit, 60_000)) {
    return NextResponse.json({ error: "rate limited, try again soon" }, { status: 429 });
  }
  return NextResponse.next();
}

export const config = { matcher: ["/api/:path*"] };
