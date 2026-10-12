import { createSign } from "node:crypto";
import { db } from "./db";

function base64url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
  token_uri?: string;
};

async function getAccessToken(account: ServiceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = [
    base64url(JSON.stringify({ alg: "RS256", typ: "JWT" })),
    base64url(JSON.stringify({
      iss: account.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: account.token_uri || "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })),
  ].join(".");
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const assertion = unsigned + "." + signer.sign(account.private_key, "base64url");
  const response = await fetch(account.token_uri || "https://oauth2.googleapis.com/token", {
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

export async function sendPushToUsers(input: {
  userIds: string[];
  title: string;
  body: string;
  path?: string;
}) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw || input.userIds.length === 0) return { configured: Boolean(raw), sent: 0, failed: 0 };
  const account = JSON.parse(raw) as ServiceAccount;
  if (!account.project_id || !account.client_email || !account.private_key) {
    throw new Error("Firebase service account configuration is incomplete.");
  }
  const tokens = await db.pushToken.findMany({
    where: { userId: { in: [...new Set(input.userIds)] } },
    select: { id: true, token: true },
  });
  if (tokens.length === 0) return { configured: true, sent: 0, failed: 0 };

  const accessToken = await getAccessToken(account);
  const path = input.path && input.path.startsWith("/") && !input.path.startsWith("//")
    ? input.path.slice(0, 300) : "/notifications";
  let sent = 0;
  let failed = 0;
  await Promise.all(tokens.map(async (device) => {
    const response = await fetch(
      "https://fcm.googleapis.com/v1/projects/" + encodeURIComponent(account.project_id) + "/messages:send",
      {
        method: "POST",
        headers: { authorization: "Bearer " + accessToken, "content-type": "application/json" },
        body: JSON.stringify({
          message: {
            token: device.token,
            notification: { title: input.title.slice(0, 120), body: input.body.slice(0, 1000) },
            data: { path },
            android: { priority: "HIGH", notification: { channel_id: "ideacon_updates" } },
          },
        }),
        cache: "no-store",
      },
    );
    if (response.ok) { sent += 1; return; }
    failed += 1;
    const error = await response.text();
    if (response.status === 404 || error.includes("UNREGISTERED")) {
      await db.pushToken.deleteMany({ where: { id: device.id } });
    }
  }));
  return { configured: true, sent, failed };
}
