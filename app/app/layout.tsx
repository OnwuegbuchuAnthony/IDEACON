import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@/lib/analytics";
import { SiteHeader } from "@/app/components/SiteHeader";
import { SiteFooter } from "@/app/components/SiteFooter";
import { OG_IMAGE, SITE_URL } from "@/lib/seo";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IDEACON — Idea + Connection",
    template: "%s — IDEACON",
  },
  description:
    "The platform that links novel ideas to the industries built to use them.",
  alternates: { canonical: SITE_URL },
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  openGraph: {
    title: "IDEACON — Idea + Connection",
    description:
      "The platform that links novel ideas to the industries built to use them.",
    url: SITE_URL,
    siteName: "IDEACON",
    type: "website",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "IDEACON — Idea + Connection",
    description:
      "The platform that links novel ideas to the industries built to use them.",
    images: [OG_IMAGE.url],
  },
};

export const viewport: Viewport = {
  themeColor: "#0EA5E9", // Metadata API needs a literal; kept equal to --color-azure.
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
        <SiteHeader />
        <div id="main-content" className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
