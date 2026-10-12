import { createSign } from "node:crypto";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

async function getAccessToken(serviceAccount: {
  client_email: string;
  private_key: string;
  token_uri?: string;
}) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = [
    base64url(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    base64url(JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: serviceAccount.token_uri || "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })),
  ].join(".");
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = unsigned + "." + signer.sign(serviceAccount.private_key, "base64url");
  const response = await fetch(serviceAccount.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Google OAuth token exchange failed.");
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("Google OAuth returned no access token.");
  return data.access_token;
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id || (session.user as { role?: string }).role !== "ADMIN") {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const rawCredentials = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawCredentials) {
    return Response.json({ error: "Push sender is not configured." }, { status: 503 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON body." }, { status: 400 }); }
  const input = body as { userIds?: unknown; title?: unknown; message?: unknown; path?: unknown } | null;
  const userIds = input?.userIds;
  const title = input?.title;
  const message = input?.message;
  const path = input?.path;
  if (!Array.isArray(userIds) || userIds.length < 1 || userIds.length > 500 ||
      !userIds.every((id) => typeof id === "string" && id.length > 0) ||
      typeof title !== "string" || !title.trim() || title.length > 120 ||
      typeof message !== "string" || !message.trim() || message.length > 1000) {
    return Response.json({ error: "Provide userIds (1–500), title, and message." }, { status: 400 });
  }
  const safePath = typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && path.length <= 300
    ? path : "/notifications";

  try {
    const serviceAccount = JSON.parse(rawCredentials) as {
      project_id: string; client_email: string; private_key: string; token_uri?: string;
    };
    if (!serviceAccount.project_id || !serviceAccount.client_email || !serviceAccount.private_key) {
      return Response.json({ error: "Firebase service account JSON is incomplete." }, { status: 503 });
    }
    const tokens = await db.pushToken.findMany({
      where: { userId: { in: [...new Set(userIds as string[])] } },
      select: { id: true, token: true },
    });
    if (!tokens.length) return Response.json({ ok: true, sent: 0, failed: 0 });

    const accessToken = await getAccessToken(serviceAccount);
    let sent = 0;
    let failed = 0;
    await Promise.all(tokens.map(async (device) => {
      const response = await fetch(
        "https://fcm.googleapis.com/v1/projects/" + encodeURIComponent(serviceAccount.project_id) + "/messages:send",
        {
          method: "POST",
          headers: { authorization: "Bearer " + accessToken, "content-type": "application/json" },
          body: JSON.stringify({
            message: {
              token: device.token,
              notification: { title: title.trim(), body: message.trim() },
              data: { path: safePath },
              android: { priority: "HIGH", notification: { channel_id: "ideacon_updates" } },
            },
          }),
          cache: "no-store",
        },
      );
      if (response.ok) { sent += 1; return; }
      failed += 1;
      const errorText = await response.text();
      if (response.status === 404 || errorText.includes("UNREGISTERED")) {
        await db.pushToken.deleteMany({ where: { id: device.id } });
      }
    }));
    return Response.json({ ok: true, sent, failed });
  } catch (error) {
    console.error("[push-send]", error instanceof Error ? error.message : "Unknown error");
    return Response.json({ error: "Push delivery failed; check server configuration." }, { status: 502 });
  }
}
