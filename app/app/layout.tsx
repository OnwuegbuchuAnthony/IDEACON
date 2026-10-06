import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@/lib/analytics";
import "./globals.css";

const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const sans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "IDEACON — Idea + Connection",
  description:
    "The platform that links novel ideas to the industries built to use them.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0F62FE",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Analytics />
        <nav className="border-b border-primary-100 bg-white/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-4 px-6 py-2 text-sm font-bold">
            <a href="/" className="font-display text-base font-extrabold">◈ IDEACON</a>
            <a href="/browse" className="text-ink/70 hover:text-primary-600">Discover</a>
            <a href="/submit" className="text-ink/70 hover:text-primary-600">Submit</a>
            <a href="/trust" className="text-ink/70 hover:text-primary-600">Trust</a>
            <a href="/about" className="text-ink/70 hover:text-primary-600">About</a>
            <a href="/ask" className="text-ink/70 hover:text-primary-600">Ask AI</a>
            <a href="/waitlist" className="text-ink/70 hover:text-primary-600">Waitlist</a>
            <a href="/dashboard" className="ml-auto text-ink/70 hover:text-primary-600">Dashboard</a>
            <a href="/profile" className="text-ink/70 hover:text-primary-600">Profile</a>
            <a href="/notifications" className="text-ink/70 hover:text-primary-600">Inbox</a>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
