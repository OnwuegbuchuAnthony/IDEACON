import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// FCM device tokens are account-scoped; callers must have a valid Better Auth session.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Sign in to enable push notifications." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const token = (body as { token?: unknown } | null)?.token;
  if (typeof token !== "string" || token.length < 20 || token.length > 4096) {
    return Response.json({ error: "Invalid push token." }, { status: 400 });
  }

  await db.pushToken.upsert({
    where: { token },
    update: { userId: session.user.id, platform: "android", updatedAt: new Date() },
    create: { token, userId: session.user.id, platform: "android" },
  });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return Response.json({ error: "Sign in required." }, { status: 401 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const token = (body as { token?: unknown } | null)?.token;
  if (typeof token !== "string") return Response.json({ error: "Invalid push token." }, { status: 400 });
  await db.pushToken.deleteMany({ where: { token, userId: session.user.id } });
  return Response.json({ ok: true });
}
