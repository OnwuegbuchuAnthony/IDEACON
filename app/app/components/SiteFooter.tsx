import Link from "next/link";
import { WaitlistForm } from "@/app/components/WaitlistForm";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/about" },
      { label: "Niches", href: "/browse" },
      { label: "Pricing", href: "/pricing" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    heading: "For you",
    links: [
      { label: "Creators", href: "/submit" },
      { label: "Companies", href: "/browse" },
      { label: "Students", href: "/students" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

/** Site footer. Server component — zero client JS. */
export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-primary-100 bg-white">
      <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-10 sm:grid-cols-2 md:grid-cols-5">
        <div className="md:col-span-1">
          <p className="font-display text-base font-extrabold">◈ IDEACON</p>
          <p className="mt-2 text-sm text-ink/60">Nigeria-first, global by design.</p>
          <div className="mt-3">
            <WaitlistForm compact />
          </div>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={`Footer — ${col.heading}`}>
            <p className="text-sm font-bold">{col.heading}</p>
            <ul className="mt-2 flex flex-col gap-1.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-ink/70 hover:text-primary-600">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-primary-100">
        <p className="mx-auto w-full max-w-5xl px-6 py-4 text-xs text-ink/50">
          © {year} IDEACON. Ideas stay teaser-only until an NDA is signed.
        </p>
      </div>
    </footer>
  );
}
