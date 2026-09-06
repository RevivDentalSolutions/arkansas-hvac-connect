import type { Metadata } from "next";
import "./globals.css";
import { SITE_URL } from "@/lib/site-pages";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Arkansas HVAC Connect | Central Arkansas HVAC Help", template: "%s | Arkansas HVAC Connect" },
  description: "Independent Central Arkansas homeowner HVAC request and referral platform. Not an HVAC contractor.",
  alternates: { canonical: "/" },
  openGraph: { title: "Arkansas HVAC Connect", description: "Independent Central Arkansas homeowner HVAC referral platform.", url: SITE_URL, siteName: "Arkansas HVAC Connect", type: "website", locale: "en_US" },
  twitter: { card: "summary", title: "Arkansas HVAC Connect", description: "Independent Central Arkansas homeowner HVAC referral platform." },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};
const graph = { "@context": "https://schema.org", "@graph": [
  { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "Arkansas HVAC Connect", url: `${SITE_URL}/`, description: "Independent Central Arkansas homeowner HVAC lead-generation and referral platform.", email: "partners@arkansashvacconnect.com" },
  { "@type": "WebSite", "@id": `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: "Arkansas HVAC Connect", publisher: { "@id": `${SITE_URL}/#organization` }, inLanguage: "en-US" },
  { "@type": "WebPage", "@id": `${SITE_URL}/#webpage`, url: `${SITE_URL}/`, name: "Central Arkansas HVAC Help", isPartOf: { "@id": `${SITE_URL}/#website` }, about: { "@id": `${SITE_URL}/#organization` } },
] };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }} /></body></html>; }
