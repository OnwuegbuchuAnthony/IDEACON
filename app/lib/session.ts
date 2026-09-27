import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import { db } from "./db";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

/** Require a signed-in user or redirect to /login. */
export async function requireUser(): Promise<SessionUser> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const u = session.user as unknown as SessionUser;
  return { id: u.id, name: u.name, email: u.email, role: u.role ?? "CREATOR" };
}

/** Require one of the given roles or redirect to /dashboard. */
export async function requireRole(...roles: string[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect("/dashboard");
  return user;
}

/** Company profile for the current user (company members only). */
export async function myCompanyId(userId: string): Promise<string | null> {
  const m = await db.companyMember.findFirst({ where: { userId } });
  return m?.companyId ?? null;
}
