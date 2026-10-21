import Link from "next/link";
import { Logo } from "@/app/components/Logo";
import { Container } from "@/app/components/Container";
import { WaitlistForm } from "@/app/components/WaitlistForm";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Discover", href: "/discover" },
      { label: "Niches", href: "/niches" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    heading: "For you",
    links: [
      { label: "Creators", href: "/creators" },
      { label: "Companies", href: "/companies" },
      { label: "Students", href: "/students" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQ", href: "/faq" },
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
    <footer className="border-t border-border bg-white">
      <Container>
        <div className="grid gap-8 py-10 sm:grid-cols-2 md:grid-cols-5">
          <div className="md:col-span-1">
            <Logo bare className="text-ink" />
            <p className="mt-2 text-sm text-ink/60">
              Linking novel ideas to the industries built to use them.
            </p>
            <div className="mt-3">
              <WaitlistForm variant="minimal" />
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
      </Container>
      <div className="border-t border-border">
        <Container>
          <p className="py-4 text-xs text-ink/50">
            © {year} IDEACON. Ideas stay teaser-only until an NDA is signed.
          </p>
        </Container>
      </div>
    </footer>
  );
}
