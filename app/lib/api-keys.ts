import { createHash, randomBytes } from "node:crypto";
import { db } from "./db";

export const API_SCOPES = ["teasers:read", "evidence:read"] as const;

/** Issue a key. The secret is shown ONCE — only its hash is stored. */
export async function issueApiKey(input: { companyId: string; name: string }) {
  const secret = `idcn_${randomBytes(24).toString("hex")}`;
  const keyHash = createHash("sha256").update(secret).digest("hex");
  const key = await db.apiKey.create({
    data: {
      companyId: input.companyId,
      name: input.name,
      keyHash,
      keyPrefix: secret.slice(0, 8),
    },
  });
  return { key, secret };
}

export async function revokeApiKey(id: string) {
  return db.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
}

/** Verify a presented secret. Returns the key row (with company) or null. */
export async function verifyApiKey(secret: string) {
  if (!secret.startsWith("idcn_")) return null;
  const keyHash = createHash("sha256").update(secret).digest("hex");
  const key = await db.apiKey.findUnique({ where: { keyHash } });
  if (!key || key.revokedAt) return null;
  await db.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  return key;
}

function bearerSecret(req: Request): string | null {
  const h = req.headers.get("authorization");
  if (!h?.startsWith("Bearer ")) return null;
  return h.slice("Bearer ".length).trim();
}

/** Gate for /api/v1 routes. Returns key or a 401 Response on failure. */
export async function requireApiScope(req: Request, scope: string) {
  const secret = bearerSecret(req);
  if (!secret) return { error: Response.json({ error: "missing bearer token" }, { status: 401 }) };
  const key = await verifyApiKey(secret);
  if (!key) return { error: Response.json({ error: "invalid or revoked key" }, { status: 401 }) };
  if (!key.scopes.split(",").includes(scope)) {
    return { error: Response.json({ error: `missing scope: ${scope}` }, { status: 403 }) };
  }
  return { key };
}
