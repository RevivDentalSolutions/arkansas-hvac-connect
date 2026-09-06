import type { MetadataRoute } from "next";
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/ac-repair",
    "/hvac-replacement",
    "/emergency-ac-repair",
    "/heating-repair",
    "/heat-pumps",
    "/little-rock",
    "/north-little-rock",
    "/conway",
    "/benton",
    "/bryant",
    "/guides/ac-not-cooling",
    "/how-it-works",
    "/privacy",
    "/terms",
    "/contact",
    "/partners",
    "/partners/apply",
    "/partners/terms",
  ];
  return routes.map((url) => ({
    url: `https://arkansashvacconnect.com${url}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: url === "" ? 1 : url === "/partners" ? 0.8 : 0.7,
  }));
}
