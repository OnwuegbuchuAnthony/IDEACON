import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Confirm your spot — IDEACON",
  description: "Confirm your IDEACON waitlist email.",
  robots: { index: false },
};

/** Double opt-in confirmation: ?token=… marks the entry verified (idempotent). */
export default async function WaitlistVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  let state: "ok" | "invalid" | "missing" = "missing";
  if (token) {
    const entry = await db.waitlistEntry
      .findUnique({ where: { verifyToken: token } })
      .catch(() => null);
    if (!entry) {
      state = "invalid";
    } else {
      if (!entry.verified) {
        await db.waitlistEntry
          .update({
            where: { id: entry.id },
            data: { verified: true, verifiedAt: new Date(), verifyToken: null },
          })
          .catch(() => null);
      }
      state = "ok";
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-6 py-16 text-center">
      {state === "ok" && (
        <>
          <h1 className="font-display text-3xl font-extrabold">You&apos;re confirmed ✓</h1>
          <p className="text-ink/70">
            Your waitlist spot is locked in. We&apos;ll email you at launch — meanwhile,{" "}
            <Link href="/browse" className="font-bold text-primary-600 underline">browse live teasers</Link>{" "}
            or <Link href="/about" className="font-bold text-primary-600 underline">see how IDEACON works</Link>.
          </p>
        </>
      )}
      {state === "invalid" && (
        <>
          <h1 className="font-display text-3xl font-extrabold">Link expired</h1>
          <p className="text-ink/70">
            This confirmation link is invalid or already used.{" "}
            <Link href="/waitlist" className="font-bold text-primary-600 underline">Join the waitlist again</Link>{" "}
            and we&apos;ll send a fresh link.
          </p>
        </>
      )}
      {state === "missing" && (
        <>
          <h1 className="font-display text-3xl font-extrabold">Check your inbox</h1>
          <p className="text-ink/70">
            We sent a confirmation link to your email. Open it to lock in your spot — or{" "}
            <Link href="/waitlist" className="font-bold text-primary-600 underline">resubmit here</Link>{" "}
            if it never arrived.
          </p>
        </>
      )}
    </main>
  );
}
