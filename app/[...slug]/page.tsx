import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketplacePage } from "@/components/marketplace-page";
import { pageMap, pages, SITE_URL } from "@/lib/site-pages";

export const dynamicParams = false;
export function generateStaticParams() {
  return pages.map((page) => ({ slug: page.path.slice(1).split("/") }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = pageMap.get(`/${slug.join("/")}`);
  if (!page) return {};
  const url = `${SITE_URL}${page.path}`;
  return {
    title: { absolute: page.metaTitle },
    description: page.description,
    alternates: { canonical: page.path },
    robots: page.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: { type: page.type === "guide" ? "article" : "website", url, title: page.metaTitle, description: page.description, siteName: "Arkansas HVAC Connect", locale: "en_US" },
    twitter: { card: "summary", title: page.metaTitle, description: page.description },
  };
}
export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = `/${slug.join("/")}`;
  const page = pageMap.get(path);
  if (!page) notFound();
  const schemas: Record<string, unknown>[] = [{ "@context": "https://schema.org", "@type": page.type === "guide" ? "Article" : "WebPage", "@id": `${SITE_URL}${path}#webpage`, url: `${SITE_URL}${path}`, name: page.title, description: page.description, isPartOf: { "@id": `${SITE_URL}/#website` }, ...(page.type === "guide" ? { headline: page.title, dateModified: "2026-09-06", author: { "@id": `${SITE_URL}/#organization` }, publisher: { "@id": `${SITE_URL}/#organization` } } : {}) }, { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` }, ...(page.type === "guide" ? [{ "@type": "ListItem", position: 2, name: "Guides", item: `${SITE_URL}/guides` }] : []), { "@type": "ListItem", position: page.type === "guide" ? 3 : 2, name: page.title, item: `${SITE_URL}${path}` }] }];
  if (page.faq) schemas.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: page.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) });
  return <><MarketplacePage path={path} page={page} />{schemas.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />)}</>;
}
