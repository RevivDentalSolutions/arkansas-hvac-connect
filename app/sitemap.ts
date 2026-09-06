import type { MetadataRoute } from "next";
import { pages, SITE_URL } from "@/lib/site-pages";
export default function sitemap(): MetadataRoute.Sitemap {
  const homeownerPages = pages.filter((page) => !page.noindex && !["/contact"].includes(page.path));
  return [{ url: `${SITE_URL}/`, lastModified: "2026-09-06", changeFrequency: "weekly" as const, priority: 1 }, { url: `${SITE_URL}/partners`, lastModified: "2026-09-06", changeFrequency: "monthly" as const, priority: 0.5 }, ...homeownerPages.map((page) => ({ url: `${SITE_URL}${page.path}`, lastModified: "2026-09-06", changeFrequency: page.type === "guide" ? "monthly" as const : "weekly" as const, priority: page.type === "service" ? 0.9 : page.type === "location" ? 0.8 : 0.7 }))];
}
