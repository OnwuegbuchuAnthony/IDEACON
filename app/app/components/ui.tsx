import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Shared UI primitives. Single-responsibility presentational components —
 * no data fetching, no auth, no routing logic. Token classes only.
 */

export function Card({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <div
      className={
        accent
          ? "rounded-2xl border-2 border-teal-500 bg-white p-5 shadow"
          : "rounded-2xl border border-primary-100 bg-white p-5 shadow"
      }
    >
      {children}
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-primary-100 bg-white px-4 py-2 text-sm shadow">
      {children}
    </div>
  );
}

export function RowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="card-hover rounded-xl border border-primary-100 bg-white px-4 py-2 text-sm shadow">
      {children}
    </Link>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-xl font-bold">{children}</h2>;
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h1 className="font-display text-3xl font-extrabold">{children}</h1>;
}
