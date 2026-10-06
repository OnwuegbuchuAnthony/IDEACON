import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://ideacon.netlify.app";

export const OG_IMAGE = {
  url: "/brand/og.png",
  width: 1200,
  height: 630,
  alt: "IDEACON — Idea + Connection",
};

/** Canonical + OG + Twitter tags for a page. Keeps per-page metadata uniform. */
export function pageMeta(input: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${SITE_URL}${input.path}`;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: "IDEACON",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [OG_IMAGE.url],
    },
  };
}
