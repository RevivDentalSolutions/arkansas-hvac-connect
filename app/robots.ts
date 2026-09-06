import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-pages";
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/partners/apply", "/partners/terms"] }], sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
