import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { r2PutUrl } from "@/lib/r2";

/** Presigned browser → R2 upload URL. 503 until R2 credentials are set. */
export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { key, contentType } = (await req.json()) as { key?: string; contentType?: string };
  if (!key || !contentType) {
    return NextResponse.json({ error: "key and contentType required" }, { status: 400 });
  }
  try {
    const url = await r2PutUrl(`uploads/${session.user.id}/${key}`, contentType);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "storage not configured" }, { status: 503 });
  }
}
