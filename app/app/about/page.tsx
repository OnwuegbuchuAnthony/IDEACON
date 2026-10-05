import Link from "next/link";

// Public About: what IDEACON is, how it works, socials + contact.
export default function AboutPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
      <header>
        <p className="text-sm font-bold text-primary-600">About</p>
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          Idea + Connection
        </h1>
        <p className="mt-3 text-lg text-ink/80">
          IDEACON is the platform that links novel ideas to the industries
          built to use them. Independent inventors, everyday people, experts
          and students submit ideas; startups and enterprises across
          HealthTech, AgroTech, FinTech and general business discover them,
          license them, and build with their creators.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {[
          ["Submit (teased)", "Ideas show niche, uniqueness and scale — full detail stays locked behind NDA."],
          ["Vetted, not noise", "Expert review board verdicts plus explainable AI score bands."],
          ["Brokered handoff", "No open chat. The IDEACON team manages every company↔creator introduction."],
          ["Protected & paid", "Timestamped proof-of-origin, NDA-gated disclosure, licensing or partnership terms."],
        ].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-primary-100 bg-white p-5 shadow">
            <h2 className="font-display font-bold">{t}</h2>
            <p className="mt-1 text-sm text-ink/70">{d}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-gradient-to-r from-primary-800 via-primary-600 to-teal-500 p-6 text-white">
        <h2 className="font-display text-xl font-bold">Nigeria-first, global by design</h2>
        <p className="mt-1 text-sm opacity-90">
          Launching with companies across Lagos, Abuja, Rivers, Kano, Ogun and
          beyond — plus a university pipeline turning student projects into
          real-world innovations.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
          <Link href="/browse" className="rounded-full bg-white px-5 py-2 text-primary-800">Discover ideas</Link>
          <Link href="/signup" className="rounded-full bg-white/20 px-5 py-2">Join IDEACON</Link>
        </div>
      </section>

      <section className="rounded-2xl border border-primary-100 bg-white p-6 shadow">
        <h2 className="font-display text-xl font-bold">Contact us</h2>
        <p className="mt-1 text-sm text-ink/70">
          Partnerships, universities, press, support — we reply within 2 business days.
        </p>
        <a href="mailto:ideaconnectglobal@gmail.com" className="mt-3 inline-block rounded-full bg-primary-600 px-6 py-2 text-sm font-bold text-white">
          ✉ ideaconnectglobal@gmail.com
        </a>
        <div className="mt-5 flex items-center gap-3">
          <span className="text-sm font-bold text-ink/60">Follow:</span>
          <a href="https://x.com/ideacon" target="_blank" rel="noopener noreferrer" aria-label="IDEACON on X" title="X"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white hover:bg-primary-600">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z" />
            </svg>
          </a>
          <a href="https://www.linkedin.com/company/ideacon" target="_blank" rel="noopener noreferrer" aria-label="IDEACON on LinkedIn" title="LinkedIn"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white hover:bg-primary-600">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.55V9h3.57v11.45Z" />
            </svg>
          </a>
          <a href="https://www.instagram.com/ideacon" target="_blank" rel="noopener noreferrer" aria-label="IDEACON on Instagram" title="Instagram"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white hover:bg-primary-600">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
              <circle cx="12" cy="12" r="4.5" />
              <circle cx="17.6" cy="6.4" r="1.4" fill="currentColor" stroke="none" />
            </svg>
          </a>
          <a href="https://www.facebook.com/ideacon" target="_blank" rel="noopener noreferrer" aria-label="IDEACON on Facebook" title="Facebook"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-white hover:bg-primary-600">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M13.5 21v-7h2.4l.4-3h-2.8V9.1c0-.9.3-1.5 1.6-1.5h1.3V4.9c-.3 0-1.1-.1-2-.1-2 0-3.4 1.2-3.4 3.5V11H8.5v3H11v7h2.5Z" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}
