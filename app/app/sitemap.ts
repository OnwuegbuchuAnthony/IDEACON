import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Public marketing/content routes. Authed app routes stay out by design.
// (Idea detail URLs join here once public teaser pages ship.)
const PATHS = [
  "/",
  "/about",
  "/browse",
  "/discover",
  "/creators",
  "/companies",
  "/students",
  "/university",
  "/pricing",
  "/trust",
  "/faq",
  "/waitlist",
  "/contact",
  "/terms",
  "/privacy",
  "/ask",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
