import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://arkansashvacconnect.com"),
  title: "Arkansas HVAC Connect | Local HVAC Help",
  description:
    "Request HVAC repair or replacement help from participating Central Arkansas professionals.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Arkansas HVAC Connect | Local HVAC Help",
    description:
      "Central Arkansas homeowner referral service for HVAC repair and replacement requests.",
    url: "https://arkansashvacconnect.com",
    siteName: "Arkansas HVAC Connect",
    type: "website",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Arkansas HVAC Connect",
              url: "https://arkansashvacconnect.com",
              description:
                "Independent Central Arkansas homeowner HVAC lead-generation and referral platform.",
              contactPoint: [
                {
                  "@type": "ContactPoint",
                  email: "partners@arkansashvacconnect.com",
                  contactType: "partner inquiries",
                },
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
